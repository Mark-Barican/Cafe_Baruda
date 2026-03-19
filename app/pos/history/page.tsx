import type { Metadata } from "next";
import Link from "next/link";
import { FaArrowLeftLong } from "react-icons/fa6";
import { listRecentOrders } from "@/lib/db";
import { formatCurrency } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "POS Orders History",
  description: "Recent POS transactions saved in Neon Postgres."
};

export const dynamic = "force-dynamic";

export default async function PosHistoryPage() {
  let orders: Awaited<ReturnType<typeof listRecentOrders>> = [];
  let loadError: string | null = null;

  try {
    orders = await listRecentOrders(50);
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unknown error";
  }

  return (
    <main className="section">
      <div className="container">
        <div className="section-head">
          <h1>Orders History</h1>
          <p>
            {loadError
              ? "Unable to read orders right now. Verify `DATABASE_URL` for this environment."
              : "Recent transactions captured from the POS charge workflow."}
          </p>
          <div className="section-actions">
            <Link className="btn-secondary" href="/pos">
              <FaArrowLeftLong aria-hidden />
              Back to POS
            </Link>
          </div>
        </div>

        {loadError ? (
          <p className="empty-result">{loadError}</p>
        ) : orders.length === 0 ? (
          <p className="empty-result">No orders found yet.</p>
        ) : (
          <div className="order-history-grid">
            {orders.map((order) => (
              <article className="order-history-card" key={order.id}>
                <header>
                  <h2>{order.orderNumber}</h2>
                  <p>{new Date(order.createdAt).toLocaleString("en-GB", { hour12: false })}</p>
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
        )}
      </div>
    </main>
  );
}
