import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";
import { getProducts } from "@/services/catalog";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base=getSiteUrl(); const products=await getProducts();
  return [{url:base,lastModified:new Date()},{url:`${base}/catalogo`,lastModified:new Date()},...products.map(p=>({url:`${base}/producto/${encodeURIComponent(p.slug)}`,lastModified:new Date(p.updated_at)}))];
}
