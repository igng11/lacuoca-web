import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/public/site-header";
import { WhatsAppButton } from "@/components/public/whatsapp-button";
import { formatPrice } from "@/lib/format";
import { buildProductWhatsAppUrl } from "@/lib/whatsapp";
import { getProductBySlug, getSettings } from "@/services/catalog";

export async function generateMetadata({ params }: { params: Promise<{ slug:string }> }) {
  const slug = (await params).slug;
  const product = await getProductBySlug(slug);
  if (!product) return { title:"Producto no encontrado", robots: { index:false, follow:false } };
  const description = product.short_description || product.description || undefined;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: product.image_url ? [product.image_url] : [],
    },
  };
}
export default async function ProductPage({ params }: { params: Promise<{ slug:string }> }) {
  const [product, settings] = await Promise.all([getProductBySlug((await params).slug), getSettings()]);
  if (!product) notFound();
  const wa = product.available && settings.business_open && settings.whatsapp_number ? buildProductWhatsAppUrl({ number:settings.whatsapp_number, productName:product.name, price:product.price, currency:settings.currency, showPrice:settings.show_prices }) : null;
  return <><SiteHeader settings={settings}/><main className="container section"><Link href="/catalogo">← Volver al catálogo</Link>
    <div className="card product-detail" style={{ display:"grid", marginTop:"1.5rem", overflow:"hidden" }}>
      <div className="product-image" style={{ borderRadius:0, minHeight:300 }}><Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill priority sizes="(max-width:700px) 100vw, 50vw"/></div>
      <div className="stack" style={{ padding:"clamp(1.2rem,5vw,3rem)" }}>
        <span className={`badge ${product.available?"available":"unavailable"}`}>{product.available?"Disponible":"No disponible"}</span>
        <small className="eyebrow">{product.category?.name}</small><h1 style={{ fontFamily:"Georgia,serif", fontSize:"clamp(2rem,7vw,3.5rem)", margin:0 }}>{product.name}</h1>
        {settings.show_prices && <strong style={{ color:"var(--primary)", fontSize:"1.5rem" }}>{formatPrice(product.price,settings.currency)}</strong>}
        <p style={{ lineHeight:1.7 }}>{product.description || product.short_description}</p>
        {wa ? <WhatsAppButton href={wa}/> : <p className="notice">Este producto no está disponible para consultas en este momento.</p>}
      </div>
    </div>
  </main></>;
}
