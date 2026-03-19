"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils/format";

type HistoryItem = {
  id: number;
  itemName: string;
  itemSize: string;
  quantity: number;
  lineTotal: number;
};

type HistoryOrder = {
  id: number;
  orderNumber: string;
  customerName: string;
  orderType: "in" | "out";
  itemCount: number;
  subtotal: number;
  createdAt: string;
  items: HistoryItem[];
};

export function OrderHistory() {
  const [orders, setOrders] = useState<HistoryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/orders?limit=50", { cache: "no-store" });
        const payload = (await response.json()) as { orders?: HistoryOrder[]; error?: string };
        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load orders.");
        }
        setOrders(payload.orders ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  if (loading) {
    return <p className="empty-result">Loading orders...</p>;
  }

  if (error) {
    return <p className="empty-result">{error}</p>;
  }

  if (orders.length === 0) {
    return <p className="empty-result">No orders found yet.</p>;
  }

  return (
    <div className="order-history-grid">
      {orders.map((order) => (
        <article className="order-history-card" key={order.id}>
          <header>
            <h2>{order.orderNumber}</h2>
            <p>{new Date(order.createdAt).toLocaleString("en-PH", { hour12: false })}</p>
          </header>

          <div className="order-history-meta">
            <p>
              <span>Customer</span>
              <span>{order.customerName}</span>
            </p>
            <p>
              <span>Type</span>
              <span>{order.orderType === "in" ? "Dine In" : "Takeaway"}</span>
            </p>
            <p>
              <span>Items</span>
              <span>{order.itemCount}</span>
            </p>
            <p className="grand">
              <span>Total</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </p>
          </div>

          <div className="order-history-lines">
            {order.items.map((item) => (
              <p key={item.id}>
                <span>
                  {item.itemName} ({item.itemSize}) x{item.quantity}
                </span>
                <span>{formatCurrency(item.lineTotal)}</span>
              </p>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
