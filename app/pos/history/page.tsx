import type { Metadata } from "next";
import Link from "next/link";
import { FaArrowLeftLong } from "react-icons/fa6";
import { OrderHistory } from "@/components/pos/order-history";

export const metadata: Metadata = {
  title: "POS Orders History",
  description: "Recent POS transactions saved in Neon Postgres."
};

export default function PosHistoryPage() {
  return (
    <main className="section">
      <div className="container">
        <div className="section-head">
          <h1>Orders History</h1>
          <p>Recent transactions captured from the POS charge workflow.</p>
          <div className="section-actions">
            <Link className="btn-secondary" href="/pos">
              <FaArrowLeftLong aria-hidden />
              Back to POS
            </Link>
          </div>
        </div>
        <OrderHistory />
      </div>
    </main>
  );
}
