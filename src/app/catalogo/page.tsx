import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import abiertoPot from "@/assets/img/abierto@3x.png";
import { ProductCard } from "@/components/public/product-card";
import { PublicFooter } from "@/components/public/public-footer";
import { RoughFrame } from "@/components/rough-frame";
import { SiteHeader } from "@/components/public/site-header";
import { CARD_FRAME } from "@/data/rough-frame-path";
import { formatPrice } from "@/lib/format";
import { getCategories, getProducts, getSettings } from "@/services/catalog";

export const metadata = { title: "Catálogo", alternates: { canonical: "/catalogo" } };

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;
  const [settings, categories, allProducts] = await Promise.all([getSettings(), getCategories(), getProducts()]);
  const categoryIdsWithProducts = new Set(allProducts.map((product) => product.category_id));
  const publishedCategories = categories.filter((category) => categoryIdsWithProducts.has(category.id));
  const products = categoria
    ? allProducts.filter((product) => product.category?.slug === categoria)
    : allProducts;
  const selectedCategory = publishedCategories.find((category) => category.slug === categoria);
  const availablePrices = allProducts.filter((product) => product.available && product.price > 0).map((product) => product.price);
  const priceFrequency = availablePrices.reduce((counts, price) => counts.set(price, (counts.get(price) || 0) + 1), new Map<number, number>());
  const individualPrice = [...priceFrequency.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0]?.[0];
  const comboPrice = individualPrice ? individualPrice * 5 * 0.75 : null;

  return <>
    <SiteHeader current="catalog" settings={settings} />
    <main className="public-main catalog-main">
      <header className="catalog-hero">
        <div className="container catalog-hero-inner">
          <Image className="catalog-hero-pot" src={abiertoPot} alt="" priority={false} />
          <div className="catalog-hero-copy">
            <span className="eyebrow">Nuestro menú</span>
            <h1 className="page-title catalog-hero-title">Sabores para cada momento</h1>
            <p className="catalog-hero-note">Viandas frizadas, aptas para horno y microondas.</p>
            {settings.show_prices && individualPrice && comboPrice && (
              <div className="catalog-price-options" aria-label="Precios de las viandas">
                <div className="catalog-price-box catalog-price-box-featured">
                  <RoughFrame shape={CARD_FRAME} color="var(--red)" className="rough-lines price-option-frame" />
                  <span>Pack semanal</span>
                  <strong>{formatPrice(comboPrice, settings.currency)}</strong>
                  <small>5 viandas · 25% de descuento</small>
                </div>
                <div className="catalog-price-box">
                  <RoughFrame shape={CARD_FRAME} color="var(--blue)" className="rough-lines price-option-frame" />
                  <span>Individual</span>
                  <strong>{formatPrice(individualPrice, settings.currency)}</strong>
                  <small>Por vianda</small>
                </div>
              </div>
            )}
            <ul className="catalog-hero-prices">
              <li>Envíos gratis todo Vicente López. Otras zonas, consultar.</li>
              <li>Entregas días miércoles y sábados.</li>
            </ul>
          </div>
        </div>
      </header>
      <div className="container catalog-content">
        <nav className="filters catalog-filters" aria-label="Categorías">
          <Link className={`filter ${!categoria ? "active" : ""}`} aria-current={!categoria ? "page" : undefined} href="/catalogo">Todos</Link>
          {publishedCategories.map((category) => <Link key={category.id} className={`filter ${categoria === category.slug ? "active" : ""}`} aria-current={categoria === category.slug ? "page" : undefined} href={`/catalogo?categoria=${category.slug}`}>{category.name}</Link>)}
        </nav>
        <div className="catalog-results-heading">
          <div><span className="eyebrow">{selectedCategory ? "Categoría" : "Selección completa"}</span><h2>{selectedCategory?.name || "Todos los productos"}</h2></div>
          <span>{products.length} {products.length === 1 ? "producto" : "productos"}</span>
        </div>
        {products.length
          ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} settings={settings} />)}</div>
          : <div className="empty public-empty"><h2>No encontramos productos en esta categoría</h2><p>Probá con otra opción o volvé a ver el menú completo.</p><Link className="btn btn-soft" href="/catalogo"><ArrowLeft size={17} aria-hidden="true" /> Ver todos</Link></div>}
      </div>
    </main>
    <PublicFooter settings={settings} />
  </>;
}
