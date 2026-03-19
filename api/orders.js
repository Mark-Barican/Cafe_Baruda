/* eslint-disable @typescript-eslint/no-require-imports */
const { neon } = require("@neondatabase/serverless");

let schemaReady = null;

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set.");
  }
  return neon(url);
}

async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = getSql();

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

      await sql`CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);`;
    })();
  }

  return schemaReady;
}

function orderNumber() {
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

function send(res, status, payload) {
  res.status(status).json(payload);
}

function sanitize(value) {
  return String(value ?? "").trim();
}

function validOrderType(value) {
  const v = sanitize(value).toLowerCase();
  return v === "in" || v === "out" ? v : null;
}

async function listOrders(res, req) {
  await ensureSchema();
  const sql = getSql();
  const limit = Math.max(1, Math.min(100, Number.parseInt(String(req.query.limit ?? "25"), 10) || 25));

  const orders = await sql`
    SELECT id, order_number, customer_name, order_type, item_count, subtotal, created_at
    FROM orders
    ORDER BY created_at DESC
    LIMIT ${limit};
  `;

  if (orders.length === 0) {
    return send(res, 200, { orders: [] });
  }

  const orderIds = orders.map((row) => row.id);
  const items = await sql`
    SELECT id, order_id, item_id, item_sku, item_name, item_category, item_size, unit_price, quantity, line_total
    FROM order_items
    WHERE order_id = ANY(${orderIds}::bigint[])
    ORDER BY id ASC;
  `;

  const byOrder = new Map();
  for (const item of items) {
    const existing = byOrder.get(item.order_id) ?? [];
    existing.push({
      id: item.id,
      itemId: item.item_id,
      itemSku: item.item_sku,
      itemName: item.item_name,
      itemCategory: item.item_category,
      itemSize: item.item_size,
      unitPrice: Number(item.unit_price),
      quantity: item.quantity,
      lineTotal: Number(item.line_total)
    });
    byOrder.set(item.order_id, existing);
  }

  const shaped = orders.map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    orderType: row.order_type,
    itemCount: row.item_count,
    subtotal: Number(row.subtotal),
    createdAt: row.created_at,
    items: byOrder.get(row.id) ?? []
  }));

  return send(res, 200, { orders: shaped });
}

async function createOrder(req, res) {
  await ensureSchema();
  const sql = getSql();

  const customerName = sanitize(req.body?.customerName) || "Guest";
  const type = validOrderType(req.body?.orderType);
  const items = Array.isArray(req.body?.items) ? req.body.items : [];

  if (!type) {
    return send(res, 400, { error: "Invalid order type." });
  }

  if (items.length === 0) {
    return send(res, 400, { error: "Order must contain at least one item." });
  }

  const cleanItems = [];
  for (const item of items) {
    const id = sanitize(item.id);
    const sku = sanitize(item.sku);
    const name = sanitize(item.name);
    const category = sanitize(item.category);
    const size = sanitize(item.size) || "Standard";
    const qty = Number(item.qty);
    const price = Number(item.price);

    if (!id || !sku || !name || !category || !Number.isInteger(qty) || qty <= 0 || !Number.isFinite(price) || price < 0) {
      return send(res, 400, { error: "Invalid order item payload." });
    }

    cleanItems.push({ id, sku, name, category, size, qty, price });
  }

  const number = orderNumber();
  const itemCount = cleanItems.reduce((sum, line) => sum + line.qty, 0);
  const total = cleanItems.reduce((sum, line) => sum + line.price * line.qty, 0);

  const statements = [
    sql`
      INSERT INTO orders (order_number, customer_name, order_type, item_count, subtotal)
      VALUES (${number}, ${customerName}, ${type}, ${itemCount}, ${total.toFixed(2)});
    `
  ];

  for (const line of cleanItems) {
    statements.push(sql`
      INSERT INTO order_items (
        order_id, item_id, item_sku, item_name, item_category, item_size, unit_price, quantity, line_total
      )
      SELECT id, ${line.id}, ${line.sku}, ${line.name}, ${line.category}, ${line.size}, ${line.price.toFixed(2)},
             ${line.qty}, ${(line.price * line.qty).toFixed(2)}
      FROM orders
      WHERE order_number = ${number};
    `);
  }

  await sql.transaction(statements);

  return send(res, 201, {
    orderNumber: number,
    itemCount,
    total
  });
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      return await listOrders(res, req);
    }

    if (req.method === "POST") {
      return await createOrder(req, res);
    }

    res.setHeader("Allow", "GET, POST");
    return send(res, 405, { error: "Method not allowed." });
  } catch (error) {
    console.error("api/orders failed", error);
    return send(res, 500, { error: "Internal server error." });
  }
};
