import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
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

  const currency = /^[A-Z]{3}$/.test(settings.currency) ? settings.currency : "ARS";
  const price = settings.show_prices
    ? new Intl.NumberFormat("es-AR", { style: "currency", currency, maximumFractionDigits: 0 }).format(product.price)
    : null;

  return (
    <article className="card product-card">
      <Link className="product-card-media" href={`/producto/${product.slug}`} aria-label={product.name}>
        <div className={`product-media ${product.image_url ? "" : "is-placeholder"}`}>
          <Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill sizes="(max-width: 700px) 100vw, 33vw" />
        </div>
        <span className="product-media-dots" aria-hidden="true">
          <span className="is-active" />
          <span />
          <span />
        </span>
      </Link>

      <div className="product-card-body">
        <div className="product-header">
          <h3 className="product-title">
            <Link href={`/producto/${product.slug}`}>{product.name}</Link>
          </h3>
          {price && <span className="product-price-badge">{price}</span>}
        </div>

        {summary && <p className="product-description">{summary}</p>}

        <div className="product-card-actions">
          {whatsappUrl ? (
            <>
              <a className="btn btn-primary" href={whatsappUrl} target="_blank" rel="noreferrer">
                <MessageCircle size={17} aria-hidden="true" /> Consultar
              </a>
              <Link className="btn btn-soft" href={`/producto/${product.slug}`}>Detalle</Link>
            </>
          ) : (
            <Link className="btn btn-primary" href={`/producto/${product.slug}`}>Ver detalle</Link>
          )}
        </div>
      </div>
    </article>
  );
}
