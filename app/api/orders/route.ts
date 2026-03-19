import { NextResponse } from "next/server";
import { createOrder, listRecentOrders, type CreateOrderInput } from "@/lib/db";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function sanitizeString(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeOrderType(value: unknown): "in" | "out" | null {
  const normalized = sanitizeString(value).toLowerCase();
  if (normalized === "in" || normalized === "out") {
    return normalized;
  }
  return null;
}

function parsePositiveInteger(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function parseNonNegativeNumber(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CreateOrderInput>;
    const customerName = sanitizeString(body.customerName) || "Guest";
    const orderType = normalizeOrderType(body.orderType);

    if (!orderType) {
      return badRequest("Invalid order type.");
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return badRequest("Order must contain at least one item.");
    }

    const items: CreateOrderInput["items"] = [];
    for (const item of body.items) {
      const id = sanitizeString(item.id);
      const sku = sanitizeString(item.sku);
      const name = sanitizeString(item.name);
      const category = sanitizeString(item.category);
      const size = sanitizeString(item.size) || "Standard";
      const qty = parsePositiveInteger(item.qty);
      const price = parseNonNegativeNumber(item.price);

      if (!id || !sku || !name || !category || qty === null || price === null) {
        return badRequest("Invalid order item payload.");
      }

      items.push({
        id,
        sku,
        name,
        category,
        size,
        qty,
        price
      });
    }

    const result = await createOrder({
      customerName,
      orderType,
      items
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders failed", error);
    return NextResponse.json({ error: "Unable to create order." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? "25");
    const data = await listRecentOrders(limit);
    return NextResponse.json({ orders: data }, { status: 200 });
  } catch (error) {
    console.error("GET /api/orders failed", error);
    return NextResponse.json({ error: "Unable to fetch orders." }, { status: 500 });
  }
}
