import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://hangbzargmjosygewazb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhbmdiemFyZ21qb3N5Z2V3YXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMzE4OTMsImV4cCI6MjA3NDgwNzg5M30.nb58jac_6oQcLAMpgmjDZ3eVgSWAlNX8XHQ3U9ZeQ6w',
);

export const getAllProducts = async (category, subcategory) => {
  let query = supabase
    .from('products')
    .select(
      'slug, title, price, compare_at_price, images, category, subcategory',
    )
    .eq('category', category);

  if (subcategory && subcategory !== '') {
    query = query.eq('subcategory', subcategory);
  }

  const { data: products, error } = await query;

  if (error) {
    return [];
  } else {
    return products;
  }
};
