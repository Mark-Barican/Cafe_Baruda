import type { Metadata } from "next";
import { MenuCatalog } from "@/components/menu/menu-catalog";
import { getCafeData } from "@/lib/data/menu";

export const metadata: Metadata = {
  title: "Menu",
  description: "Browse the latest cafe menu with category filtering and search."
};

export default async function MenuPage() {
  const { menuItems, categories } = await getCafeData();

  return (
    <main className="section">
      <div className="container">
        <div className="section-head">
          <h1>Menu</h1>
          <p>Filter by category, search by ingredient, and view current prices.</p>
        </div>
        <MenuCatalog categories={categories} menuItems={menuItems} />
      </div>
    </main>
  );
}
