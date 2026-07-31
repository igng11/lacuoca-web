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
  return <><SiteHeader settings={settings} current="catalog"/><main className="container section product-page"><Link className="back-link" href="/catalogo">← Volver al catálogo</Link>
    <div className="card product-detail">
      <div className={`product-image product-detail-image ${product.image_url ? "" : "is-placeholder"}`}><Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill priority sizes="(max-width:700px) 100vw, 50vw"/></div>
      <div className="stack product-detail-content">
        <span className={`badge ${product.available?"available":"unavailable"}`}>{product.available?"Disponible":"No disponible"}</span>
        <small className="eyebrow">{product.category?.name}</small><h1>{product.name}</h1>
        {settings.show_prices && <strong className="product-detail-price">{formatPrice(product.price,settings.currency)}</strong>}
        {(product.description || product.short_description) && <p className="product-detail-description">{product.description || product.short_description}</p>}
        {wa ? <WhatsAppButton href={wa}/> : <p className="notice">Este producto no está disponible para consultas en este momento.</p>}
      </div>
    </div>
  </main></>;
}
