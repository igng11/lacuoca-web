import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { BusinessSettings, Product } from "@/types/database";

export function ProductCard({ product, settings }: { product: Product; settings: BusinessSettings }) {
  return <article className="card product-card">
    <Link href={`/producto/${product.slug}`}>
      <div className="product-image">
        <Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill sizes="(max-width: 700px) 100vw, 33vw" />
      </div>
      <div className="product-body">
        <div style={{ display:"flex", justifyContent:"space-between", gap:".5rem", alignItems:"start" }}>
          <span className={`badge ${product.available ? "available" : "unavailable"}`}>{product.available ? "Disponible" : "No disponible"}</span>
          {product.featured && <span className="badge" style={{ background:"#fef3c7", color:"#92400e" }}>Destacado</span>}
        </div>
        <div><h3 style={{ margin:0, fontSize:"1.18rem" }}>{product.name}</h3><small className="muted">{product.category?.name}</small></div>
        {product.short_description && <p className="muted" style={{ margin:0 }}>{product.short_description}</p>}
        {settings.show_prices && <strong style={{ fontSize:"1.2rem", color:"var(--primary)" }}>{formatPrice(product.price, settings.currency)}</strong>}
      </div>
    </Link>
  </article>;
}
