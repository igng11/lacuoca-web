import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { storagePathFromPublicUrl } from "@/lib/storage";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";
import type { BusinessSettings, Category, Product } from "@/types/database";

export const defaultSettings: BusinessSettings = {
  id: "", business_name: "Tu negocio", description: "Configurá Supabase para publicar tu catálogo.",
  logo_url: null, hero_image_url: null, whatsapp_number: null,
  whatsapp_default_message: "Hola, quiero hacer una consulta.", address: null, opening_hours: null,
  instagram_url: null, primary_color: "#B45309", secondary_color: "#14532D",
  hero_title: "Sabores hechos con cariño", hero_subtitle: "Un catálogo simple para elegir lo que más te gusta.",
  currency: "ARS", show_prices: true, business_open: true, created_at: "", updated_at: "",
};

function sanitizeSettings(settings: BusinessSettings): BusinessSettings {
  const httpUrl = (value: string | null) => {
    if (!value) return null;
    try {
      const protocol = new URL(value).protocol;
      return protocol === "http:" || protocol === "https:" ? value : null;
    } catch {
      return null;
    }
  };

  return {
    ...settings,
    business_name: settings.business_name.trim() || defaultSettings.business_name,
    hero_title: settings.hero_title.trim() || defaultSettings.hero_title,
    primary_color: /^#[0-9a-fA-F]{6}$/.test(settings.primary_color) ? settings.primary_color : defaultSettings.primary_color,
    secondary_color: /^#[0-9a-fA-F]{6}$/.test(settings.secondary_color) ? settings.secondary_color : defaultSettings.secondary_color,
    currency: /^[A-Z]{3}$/.test(settings.currency) ? settings.currency : defaultSettings.currency,
    instagram_url: httpUrl(settings.instagram_url),
    whatsapp_number: settings.whatsapp_number ? normalizeWhatsAppNumber(settings.whatsapp_number) : null,
    logo_url: storagePathFromPublicUrl(settings.logo_url, "branding") ? settings.logo_url : null,
    hero_image_url: storagePathFromPublicUrl(settings.hero_image_url, "branding") ? settings.hero_image_url : null,
  };
}

function sanitizeProduct(product: Product): Product {
  return {
    ...product,
    image_url: storagePathFromPublicUrl(product.image_url, "products") ? product.image_url : null,
  };
}

export async function getSettings() {
  if (!hasSupabaseEnv()) return defaultSettings;
  const supabase = await createClient();
  const { data, error } = await supabase.from("business_settings").select("*").limit(1).maybeSingle();
  if (error) throw new Error("No se pudo cargar la configuración del negocio.", { cause: error });
  return data ? sanitizeSettings(data as BusinessSettings) : defaultSettings;
}

export async function getCategories(includeInactive = false) {
  if (!hasSupabaseEnv()) return [] as Category[];
  const supabase = await createClient();
  let query = supabase.from("categories").select("*").order("display_order").order("name");
  if (!includeInactive) query = query.eq("active", true);
  const { data, error } = await query;
  if (error) throw new Error("No se pudieron cargar las categorías.", { cause: error });
  return data as Category[];
}

export async function getProducts(options: { includeInactive?: boolean; category?: string; featured?: boolean } = {}) {
  if (!hasSupabaseEnv()) return [] as Product[];
  const supabase = await createClient();
  let query = supabase.from("products").select("*, category:categories!inner(id,name,slug)")
    .order("display_order").order("name");
  if (!options.includeInactive) query = query.eq("active", true);
  if (!options.includeInactive) query = query.eq("categories.active", true);
  if (options.category) query = query.eq("categories.slug", options.category);
  if (options.featured) query = query.eq("featured", true);
  const { data, error } = await query;
  if (error) throw new Error("No se pudieron cargar los productos.", { cause: error });
  return (data as Product[]).map(sanitizeProduct);
}

export async function getProductBySlug(slug: string) {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("*, category:categories!inner(id,name,slug)")
    .eq("slug", slug).eq("active", true).eq("categories.active", true).maybeSingle();
  if (error) throw new Error("No se pudo cargar el producto.", { cause: error });
  return data ? sanitizeProduct(data as Product) : null;
}
