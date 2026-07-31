const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const fallbackSiteUrl = "http://localhost:3000";

export function hasSupabaseEnv() {
  if (!url || !key || url.includes("YOUR_PROJECT") || key.includes("YOUR_")) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function getSupabaseEnv() {
  if (!hasSupabaseEnv() || !url || !key) throw new Error("Falta configurar Supabase.");
  return { url, key };
}

export function getSiteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return fallbackSiteUrl;
    return parsed.origin;
  } catch {
    return fallbackSiteUrl;
  }
}
