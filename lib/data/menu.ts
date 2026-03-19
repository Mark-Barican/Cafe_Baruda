import { cache } from "react";
import { loadTabular } from "@/lib/data/loaders";
import type { CafeData, MenuItem, RawIngredient, RawMenuItem, RawRecipeRow } from "@/lib/types";

const DEFAULT_GBP_TO_PHP_RATE = 73;

function getGbpToPhpRate(): number {
  const configured = Number(process.env.GBP_TO_PHP_RATE);
  if (Number.isFinite(configured) && configured > 0) {
    return configured;
  }
  return DEFAULT_GBP_TO_PHP_RATE;
}

function normalizeSize(size: string): string {
  const clean = size.trim();
  return clean === "N/A" || clean.length === 0 ? "Standard" : clean;
}

function parsePrice(value: string | number): number {
  const numberValue = typeof value === "number" ? value : Number.parseFloat(String(value));
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function convertGbpToPhp(gbpAmount: number): number {
  const rate = getGbpToPhpRate();
  const phpValue = gbpAmount * rate;
  return Math.round(phpValue * 100) / 100;
}

function toCategoryId(category: string): string {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function sanitizeCell(value: unknown): string {
  return String(value ?? "").trim();
}

export const getCafeData = cache(async (): Promise<CafeData> => {
  const [itemsRows, recipeRows, ingredientRows] = await Promise.all([
    loadTabular("items"),
    loadTabular("recipe"),
    loadTabular("ingredients")
  ]);

  const recipes = recipeRows as unknown as RawRecipeRow[];
  const ingredients = ingredientRows as unknown as RawIngredient[];
  const ingredientMap = new Map(ingredients.map((ing) => [sanitizeCell(ing.ing_id), sanitizeCell(ing.ing_name)]));

  const ingredientBySku = new Map<string, string[]>();
  for (const row of recipes) {
    const recipeSku = sanitizeCell(row.recipe_id);
    const ingredientId = sanitizeCell(row.ing_id);
    const ingredientName = ingredientMap.get(ingredientId);
    if (!ingredientName) {
      continue;
    }

    const existing = ingredientBySku.get(recipeSku) ?? [];
    if (!existing.includes(ingredientName)) {
      existing.push(ingredientName);
      ingredientBySku.set(recipeSku, existing);
    }
  }

  const menuItems: MenuItem[] = (itemsRows as unknown as RawMenuItem[]).map((row) => {
    const sku = sanitizeCell(row.sku);

    return {
      id: sanitizeCell(row.item_id),
      sku,
      name: sanitizeCell(row.item_name),
      category: sanitizeCell(row.item_cat),
      size: normalizeSize(sanitizeCell(row.item_size)),
      price: convertGbpToPhp(parsePrice(row.item_price)),
      ingredients: ingredientBySku.get(sku) ?? []
    };
  });

  const categories = Array.from(
    menuItems.reduce<Map<string, { label: string; itemCount: number }>>((acc, item) => {
      const key = toCategoryId(item.category);
      const current = acc.get(key);
      if (!current) {
        acc.set(key, { label: item.category, itemCount: 1 });
      } else {
        current.itemCount += 1;
        acc.set(key, current);
      }
      return acc;
    }, new Map())
  ).map(([id, value]) => ({ id, ...value }));

  return {
    menuItems: menuItems.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)),
    categories: categories.sort((a, b) => a.label.localeCompare(b.label))
  };
});
