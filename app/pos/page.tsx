import type { Metadata } from "next";
import Link from "next/link";
import { FaClockRotateLeft } from "react-icons/fa6";
import { PosTerminal } from "@/components/pos/pos-terminal";
import { getCafeData } from "@/lib/data/menu";

export const metadata: Metadata = {
  title: "POS",
  description: "Dedicated point-of-sale ordering interface for staff operations."
};

export default async function PosPage() {
  const { menuItems, categories } = await getCafeData();

  return (
    <main className="section">
      <div className="container">
        <div className="section-head">
          <h1>POS Terminal</h1>
          <p>This section is separated from the customer-facing pages for internal ordering workflows.</p>
          <div className="section-actions">
            <Link className="btn-secondary" href="/pos/history">
              <FaClockRotateLeft aria-hidden />
              View Orders History
            </Link>
          </div>
        </div>
        <PosTerminal categories={categories} menuItems={menuItems} />
      </div>
    </main>
  );
}
