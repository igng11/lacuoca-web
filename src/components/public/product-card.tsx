import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { BusinessSettings, Product } from "@/types/database";

export function ProductCard({ product, settings }: { product: Product; settings: BusinessSettings }) {
  return <article className="card product-card">
    <Link className="product-card-link" href={`/producto/${product.slug}`}>
      <div className={`product-image ${product.image_url ? "" : "is-placeholder"}`}>
        <Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill sizes="(max-width: 700px) 100vw, 33vw" />
      </div>
      <div className="product-body">
        <div className="product-badges">
          <span className={`badge ${product.available ? "available" : "unavailable"}`}>{product.available ? "Disponible" : "No disponible"}</span>
          {product.featured && <span className="badge featured">Destacado</span>}
        </div>
        <div className="product-heading"><h3>{product.name}</h3><small className="muted">{product.category?.name}</small></div>
        {product.short_description && <p className="muted product-description">{product.short_description}</p>}
        {settings.show_prices && <strong className="product-price">{formatPrice(product.price, settings.currency)}</strong>}
      </div>
    </Link>
  </article>;
}
