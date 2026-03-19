"use client";

import { useMemo, useState } from "react";
import { FaMagnifyingGlass, FaMinus, FaPlus, FaReceipt, FaTrashCan } from "react-icons/fa6";
import type { MenuCategory, MenuItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/format";

type PosTerminalProps = {
  categories: MenuCategory[];
  menuItems: MenuItem[];
};

type CartLine = {
  item: MenuItem;
  qty: number;
};

export function PosTerminal({ categories, menuItems }: PosTerminalProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [orderType, setOrderType] = useState<"in" | "out">("in");
  const [customer, setCustomer] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [isCharging, setIsCharging] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      if (!matchesCategory) {
        return false;
      }

      const normalizedQuery = query.trim().toLowerCase();
      if (!normalizedQuery) {
        return true;
      }

      return (
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.sku.toLowerCase().includes(normalizedQuery) ||
        item.ingredients.some((ingredient) => ingredient.toLowerCase().includes(normalizedQuery))
      );
    });
  }, [activeCategory, menuItems, query]);

  const subtotal = useMemo(() => cart.reduce((sum, line) => sum + line.item.price * line.qty, 0), [cart]);
  const itemCount = useMemo(() => cart.reduce((sum, line) => sum + line.qty, 0), [cart]);

  function addToCart(item: MenuItem) {
    setCart((current) => {
      const existing = current.find((line) => line.item.id === item.id);
      if (!existing) {
        return [...current, { item, qty: 1 }];
      }
      return current.map((line) =>
        line.item.id === item.id
          ? {
              ...line,
              qty: line.qty + 1
            }
          : line
      );
    });
  }

  function changeQty(itemId: string, delta: number) {
    setCart((current) =>
      current
        .map((line) =>
          line.item.id === itemId
            ? {
                ...line,
                qty: line.qty + delta
              }
            : line
        )
        .filter((line) => line.qty > 0)
    );
  }

  function clearOrder() {
    setCart([]);
    setCustomer("");
    setOrderType("in");
    setStatusMessage(null);
  }

  async function chargeOrder() {
    if (cart.length === 0 || isCharging) {
      return;
    }

    setIsCharging(true);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customerName: customer.trim() || "Guest",
          orderType,
          items: cart.map((line) => ({
            id: line.item.id,
            sku: line.item.sku,
            name: line.item.name,
            category: line.item.category,
            size: line.item.size,
            price: line.item.price,
            qty: line.qty
          }))
        })
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errorBody?.error ?? "Charge failed.");
      }

      const payload = (await response.json()) as {
        orderNumber: string;
        total: number;
      };

      setStatusMessage(`Order ${payload.orderNumber} saved. Total ${formatCurrency(payload.total)}.`);
      setCart([]);
      setCustomer("");
      setOrderType("in");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Charge failed.";
      setStatusMessage(message);
    } finally {
      setIsCharging(false);
    }
  }

  return (
    <section className="pos-layout">
      <div className="pos-menu">
        <div className="pos-toolbar">
          <div className="pos-chips">
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
                {category.label}
              </button>
            ))}
          </div>
          <label className="search-field">
            <FaMagnifyingGlass aria-hidden />
            <input
              aria-label="Search menu for POS"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search item or SKU"
              type="search"
              value={query}
            />
          </label>
        </div>

        <div className="pos-item-grid">
          {filteredItems.map((item) => (
            <button className="pos-item-card" key={item.id} onClick={() => addToCart(item)} type="button">
              <strong>{item.name}</strong>
              <span>
                {item.category} - {item.size}
              </span>
              <span>{formatCurrency(item.price)}</span>
            </button>
          ))}
        </div>
      </div>

      <aside className="pos-order">
        <header className="pos-order-head">
          <h2>Current Order</h2>
          <FaReceipt aria-hidden />
        </header>

        <div className="pos-order-meta">
          <label>
            Customer
            <input
              onChange={(event) => setCustomer(event.target.value)}
              placeholder="Walk-in customer"
              type="text"
              value={customer}
            />
          </label>
          <div className="type-switch" role="tablist" aria-label="Order type">
            <button
              className={orderType === "in" ? "active" : ""}
              onClick={() => setOrderType("in")}
              role="tab"
              type="button"
            >
              Dine In
            </button>
            <button
              className={orderType === "out" ? "active" : ""}
              onClick={() => setOrderType("out")}
              role="tab"
              type="button"
            >
              Takeaway
            </button>
          </div>
        </div>

        <div className="pos-lines">
          {cart.length === 0 ? (
            <p className="pos-empty">No items selected.</p>
          ) : (
            cart.map((line) => (
              <article className="pos-line" key={line.item.id}>
                <div>
                  <strong>{line.item.name}</strong>
                  <p>
                    {line.item.size} - {formatCurrency(line.item.price)}
                  </p>
                </div>
                <div className="pos-line-actions">
                  <button aria-label={`Decrease ${line.item.name}`} onClick={() => changeQty(line.item.id, -1)} type="button">
                    <FaMinus aria-hidden />
                  </button>
                  <span>{line.qty}</span>
                  <button aria-label={`Increase ${line.item.name}`} onClick={() => changeQty(line.item.id, 1)} type="button">
                    <FaPlus aria-hidden />
                  </button>
                </div>
                <p>{formatCurrency(line.item.price * line.qty)}</p>
              </article>
            ))
          )}
        </div>

        <div className="pos-totals">
          <p>
            <span>Order type</span>
            <span>{orderType === "in" ? "Dine In" : "Takeaway"}</span>
          </p>
          <p>
            <span>Customer</span>
            <span>{customer.trim() || "Guest"}</span>
          </p>
          <p>
            <span>Items</span>
            <span>{itemCount}</span>
          </p>
          <p className="grand">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </p>
        </div>

        <div className="pos-actions">
          <button className="btn-secondary" onClick={clearOrder} type="button">
            <FaTrashCan aria-hidden />
            Clear
          </button>
          <button className="btn-primary" disabled={cart.length === 0 || isCharging} onClick={chargeOrder} type="button">
            {isCharging ? "Saving..." : "Charge"}
          </button>
        </div>
        {statusMessage ? <p className="pos-status">{statusMessage}</p> : null}
      </aside>
    </section>
  );
}
