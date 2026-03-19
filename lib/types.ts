export type RawMenuItem = {
  item_id: string;
  sku: string;
  item_name: string;
  item_cat: string;
  item_size: string;
  item_price: string | number;
};

export type RawRecipeRow = {
  row_id: string;
  recipe_id: string;
  ing_id: string;
  quantity: string | number;
};

export type RawIngredient = {
  ing_id: string;
  ing_name: string;
  ing_weight: string | number;
  ing_meas: string;
  ing_price: string | number;
};

export type MenuItem = {
  id: string;
  sku: string;
  name: string;
  category: string;
  size: string;
  price: number;
  ingredients: string[];
};

export type MenuCategory = {
  id: string;
  label: string;
  itemCount: number;
};

export type CafeData = {
  menuItems: MenuItem[];
  categories: MenuCategory[];
};
