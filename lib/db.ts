import { neon } from "@neondatabase/serverless";

export type OrderType = "in" | "out";

export type CreateOrderItemInput = {
  id: string;
  sku: string;
  name: string;
  category: string;
  size: string;
  price: number;
  qty: number;
};

export type CreateOrderInput = {
  customerName: string;
  orderType: OrderType;
  items: CreateOrderItemInput[];
};

export type StoredOrderItem = {
  id: number;
  itemId: string;
  itemSku: string;
  itemName: string;
  itemCategory: string;
  itemSize: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type StoredOrder = {
  id: number;
  orderNumber: string;
  customerName: string;
  orderType: OrderType;
  itemCount: number;
  subtotal: number;
  createdAt: string;
  items: StoredOrderItem[];
};

function getSqlClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set.");
  }
  return neon(databaseUrl);
}

let schemaReady: Promise<void> | null = null;

function generateOrderNumber(): string {
  const now = new Date();
  const stamp = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    String(now.getUTCDate()).padStart(2, "0"),
    String(now.getUTCHours()).padStart(2, "0"),
    String(now.getUTCMinutes()).padStart(2, "0"),
    String(now.getUTCSeconds()).padStart(2, "0")
  ].join("");

  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${stamp}-${suffix}`;
}

async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = getSqlClient();
      await sql`
        CREATE TABLE IF NOT EXISTS orders (
          id BIGSERIAL PRIMARY KEY,
          order_number TEXT NOT NULL UNIQUE,
          customer_name TEXT NOT NULL,
          order_type TEXT NOT NULL CHECK (order_type IN ('in', 'out')),
          item_count INTEGER NOT NULL,
          subtotal NUMERIC(10, 2) NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS order_items (
          id BIGSERIAL PRIMARY KEY,
          order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          item_id TEXT NOT NULL,
          item_sku TEXT NOT NULL,
          item_name TEXT NOT NULL,
          item_category TEXT NOT NULL,
          item_size TEXT NOT NULL,
          unit_price NUMERIC(10, 2) NOT NULL,
          quantity INTEGER NOT NULL,
          line_total NUMERIC(10, 2) NOT NULL
        );
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
      `;
    })();
  }

  return schemaReady;
}

export async function createOrder(input: CreateOrderInput): Promise<{
  orderNumber: string;
  itemCount: number;
  total: number;
}> {
  await ensureSchema();
  const sql = getSqlClient();

  const orderNumber = generateOrderNumber();
  const itemCount = input.items.reduce((sum, line) => sum + line.qty, 0);
  const subtotal = input.items.reduce((sum, line) => sum + line.price * line.qty, 0);

  const statements = [
    sql`
      INSERT INTO orders (order_number, customer_name, order_type, item_count, subtotal)
      VALUES (${orderNumber}, ${input.customerName}, ${input.orderType}, ${itemCount}, ${subtotal.toFixed(2)});
    `
  ];

  for (const line of input.items) {
    statements.push(sql`
      INSERT INTO order_items (
        order_id,
        item_id,
        item_sku,
        item_name,
        item_category,
        item_size,
        unit_price,
        quantity,
        line_total
      )
      SELECT
        id,
        ${line.id},
        ${line.sku},
        ${line.name},
        ${line.category},
        ${line.size},
        ${line.price.toFixed(2)},
        ${line.qty},
        ${(line.price * line.qty).toFixed(2)}
      FROM orders
      WHERE order_number = ${orderNumber};
    `);
  }

  await sql.transaction(statements);

  return {
    orderNumber,
    itemCount,
    total: subtotal
  };
}

export async function listRecentOrders(limit = 25): Promise<StoredOrder[]> {
  await ensureSchema();
  const sql = getSqlClient();
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(100, Math.trunc(limit))) : 25;

  const ordersRows = (await sql`
    SELECT id, order_number, customer_name, order_type, item_count, subtotal, created_at
    FROM orders
    ORDER BY created_at DESC
    LIMIT ${safeLimit};
  `) as unknown as Array<{
    id: number;
    order_number: string;
    customer_name: string;
    order_type: OrderType;
    item_count: number;
    subtotal: string;
    created_at: string;
  }>;

  if (ordersRows.length === 0) {
    return [];
  }

  const orderIds = ordersRows.map((row) => row.id);

  const itemRows = (await sql`
    SELECT id, order_id, item_id, item_sku, item_name, item_category, item_size, unit_price, quantity, line_total
    FROM order_items
    WHERE order_id = ANY(${orderIds}::bigint[])
    ORDER BY id ASC;
  `) as unknown as Array<{
    id: number;
    order_id: number;
    item_id: string;
    item_sku: string;
    item_name: string;
    item_category: string;
    item_size: string;
    unit_price: string;
    quantity: number;
    line_total: string;
  }>;

  const groupedItems = new Map<number, StoredOrderItem[]>();
  for (const row of itemRows) {
    const item: StoredOrderItem = {
      id: row.id,
      itemId: row.item_id,
      itemSku: row.item_sku,
      itemName: row.item_name,
      itemCategory: row.item_category,
      itemSize: row.item_size,
      unitPrice: Number(row.unit_price),
      quantity: row.quantity,
      lineTotal: Number(row.line_total)
    };

    const existing = groupedItems.get(row.order_id) ?? [];
    existing.push(item);
    groupedItems.set(row.order_id, existing);
  }

  return ordersRows.map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    orderType: row.order_type,
    itemCount: row.item_count,
    subtotal: Number(row.subtotal),
    createdAt: row.created_at,
    items: groupedItems.get(row.id) ?? []
  }));
}
