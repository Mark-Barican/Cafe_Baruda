"use client";

import { useMemo, useState } from "react";
import { FaBreadSlice, FaMagnifyingGlass, FaMugHot, FaSnowflake } from "react-icons/fa6";
import type { MenuCategory, MenuItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/format";

type MenuCatalogProps = {
  menuItems: MenuItem[];
  categories: MenuCategory[];
};

function categoryIcon(categoryLabel: string) {
  const value = categoryLabel.toLowerCase();
  if (value.includes("hot")) {
    return <FaMugHot aria-hidden />;
  }
  if (value.includes("cold")) {
    return <FaSnowflake aria-hidden />;
  }
  return <FaBreadSlice aria-hidden />;
}

export function MenuCatalog({ menuItems, categories }: MenuCatalogProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      const q = query.trim().toLowerCase();
      if (!q) {
        return matchesCategory;
      }
      const matchesQuery =
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.ingredients.some((ingredient) => ingredient.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, menuItems, query]);

  return (
    <section className="menu-catalog">
      <div className="menu-toolbar">
        <div className="menu-filters">
          <button
            className={`chip ${activeCategory === "all" ? "active" : ""}`}
            onClick={() => setActiveCategory("all")}
            type="button"
          >
            All
          </button>
          {categories.map((category) => (
            <button
              className={`chip ${activeCategory === category.label ? "active" : ""}`}
              key={category.id}
              onClick={() => setActiveCategory(category.label)}
              type="button"
            >
              <span className="icon-inline">{categoryIcon(category.label)}</span>
              {category.label}
            </button>
          ))}
        </div>
        <label className="search-field">
          <FaMagnifyingGlass aria-hidden />
          <input
            aria-label="Search menu items"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by item, SKU or ingredient"
            type="search"
            value={query}
          />
        </label>
      </div>

      <div className="menu-grid">
        {filteredItems.map((item) => (
          <article className="menu-card" key={item.id}>
            <header className="menu-card-header">
              <h3>{item.name}</h3>
              <p>{formatCurrency(item.price)}</p>
            </header>
            <p className="menu-meta">
              {item.category} - {item.size}
            </p>
            <p className="menu-sku">{item.sku}</p>
            {item.ingredients.length > 0 ? (
              <ul className="ingredient-tags" aria-label={`${item.name} ingredients`}>
                {item.ingredients.slice(0, 3).map((ingredient) => (
                  <li key={`${item.id}-${ingredient}`}>{ingredient}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
      {filteredItems.length === 0 ? (
        <p className="empty-result">No menu items match your current filter.</p>
      ) : null}
    </section>
  );
}
