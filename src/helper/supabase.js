import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://hangbzargmjosygewazb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhbmdiemFyZ21qb3N5Z2V3YXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMzE4OTMsImV4cCI6MjA3NDgwNzg5M30.nb58jac_6oQcLAMpgmjDZ3eVgSWAlNX8XHQ3U9ZeQ6w',
);

export const getAllProducts = async ({
  category = null,
  subcategory = null,
  type = "all",      // "all" | "new" | "sale"
  brand = null,      // filter by brand
  sortBy = null,
  q = null,          // search keyword
} = {}) => {

  let query = supabase.from("products").select("*").eq("isActive", true);

  // Category filter
  if (category) query = query.eq("category", category);
  if (subcategory) query = query.eq("subcategory", subcategory);

  // Type filter
  const now = new Date();
  if (type === "new") {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    query = query.gte("created_at", yesterday.toISOString());
  } else if (type === "sale") {
    query = query.not("compare_at_price", "is", null); // products with compare_at_price
  }

  // Brand filter
  if (brand) query = query.eq("brand", brand);

  // Keyword search
  if (q) {
    query = query.ilike("title", `%${q}%`); // matches title containing the keyword, case-insensitive
  }

  // Sorting
  switch (sortBy) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "created_at_asc":
      query = query.order("created_at", { ascending: true });
      break;
    case "created_at_desc":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      break;
  }

  const { data: products, error } = await query;

  if (error) {
    console.error(error);
    return [];
  } else {
    return products;
  }
};


