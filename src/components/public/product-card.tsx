import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { buildProductWhatsAppUrl } from "@/lib/whatsapp";
import type { BusinessSettings, Product } from "@/types/database";

export function ProductCard({ product, settings }: { product: Product; settings: BusinessSettings }) {
  const summary = product.short_description || product.description?.split("\n").find(Boolean);
  const whatsappUrl = product.available && settings.business_open && settings.whatsapp_number
    ? buildProductWhatsAppUrl({
        number: settings.whatsapp_number,
        productName: product.name,
        price: product.price,
        currency: settings.currency,
        showPrice: settings.show_prices,
      })
    : null;

  return <article className="card product-card">
    <Link className="product-card-main" href={`/producto/${product.slug}`}>
      <div className={`product-image ${product.image_url ? "" : "is-placeholder"}`}>
        <Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill sizes="(max-width: 700px) 100vw, 33vw" />
      </div>
      <div className="product-body">
        <div className="product-meta"><span>{product.category?.name}</span>{product.featured && <span>Destacado</span>}</div>
        <div className="product-heading"><h3>{product.name}</h3></div>
        {summary && <p className="muted product-description">{summary}</p>}
        <div className="product-price-row">
          {settings.show_prices && <strong className="product-price">{formatPrice(product.price, settings.currency)}</strong>}
          <span className={`availability-dot ${product.available ? "is-available" : ""}`}>{product.available ? "Disponible" : "No disponible"}</span>
        </div>
      </div>
    </Link>
    <div className="product-card-actions">
      <Link href={`/producto/${product.slug}`}>Ver detalle <ArrowRight size={16} aria-hidden="true" /></Link>
      {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={16} aria-hidden="true" /> Consultar</a>}
    </div>
  </article>;
}
