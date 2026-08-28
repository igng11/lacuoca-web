import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/public/add-to-cart-button";
import { RoughFrame } from "@/components/rough-frame";
import { CARD_FRAME } from "@/data/rough-frame-path";
import type { BusinessSettings, Product } from "@/types/database";

export function ProductCard({ product, settings }: { product: Product; settings: BusinessSettings }) {
  const summary = product.short_description || product.description?.split("\n").find(Boolean);
  const canOrder = product.available && settings.business_open;

  const currency = /^[A-Z]{3}$/.test(settings.currency) ? settings.currency : "ARS";
  const price = settings.show_prices
    ? new Intl.NumberFormat("es-AR", { style: "currency", currency, maximumFractionDigits: 0 }).format(product.price)
    : null;

  return (
    <article className="card product-card">
      <RoughFrame shape={CARD_FRAME} />
      {product.featured && <span className="product-sticker">Recomendado!</span>}
      <Link className="product-card-media" href={`/producto/${product.slug}`} aria-label={product.name}>
        <div className="product-image-frame">
          <div className={`product-media ${product.image_url ? "" : "is-placeholder"}`}>
            <Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill sizes="(max-width: 700px) 100vw, 33vw" />
          </div>
        </div>
      </Link>

      <div className="product-card-body">
        <div className="product-header">
          <h3 className="product-title">
            <Link href={`/producto/${product.slug}`}>{product.name}</Link>
          </h3>
        </div>

        {price && (
          <div className="product-price-badge" aria-label={`Precio: ${price}`}>
            <span className="product-price-label">Precio</span>
            <strong>{price}</strong>
          </div>
        )}

        {summary && <p className="product-description">{summary}</p>}

        <div className={`product-card-actions${canOrder ? "" : " single"}`}>
          {canOrder ? (
            <>
              <AddToCartButton product={product} />
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
