export type Category = {
  id: string; name: string; slug: string; description: string | null;
  active: boolean; display_order: number; created_at: string; updated_at: string;
};

export type Product = {
  id: string; category_id: string; name: string; slug: string;
  short_description: string | null; description: string | null;
  price: number; image_url: string | null; available: boolean; featured: boolean;
  active: boolean; display_order: number; created_at: string; updated_at: string;
  category?: Pick<Category, "id" | "name" | "slug"> | null;
};

export type BusinessSettings = {
  id: string; business_name: string; description: string | null; logo_url: string | null;
  hero_image_url: string | null; whatsapp_number: string | null;
  whatsapp_default_message: string; address: string | null; opening_hours: string | null;
  instagram_url: string | null; primary_color: string; secondary_color: string;
  hero_title: string; hero_subtitle: string | null; currency: string;
  show_prices: boolean; business_open: boolean; created_at: string; updated_at: string;
};

export type DashboardStats = {
  products: number; categories: number; available: number; featured: number;
};
