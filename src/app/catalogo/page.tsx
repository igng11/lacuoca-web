import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductCard } from "@/components/public/product-card";
import { PublicFooter } from "@/components/public/public-footer";
import { SiteHeader } from "@/components/public/site-header";
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

  return <>
    <SiteHeader settings={settings} current="catalog" />
    <main className="public-main catalog-main">
      <header className="catalog-hero">
        <div className="container catalog-hero-inner">
          <span className="eyebrow">Nuestro menú</span>
          <h1 className="page-title">Sabores para cada momento</h1>
          <p>Explorá todas las preparaciones o elegí una categoría para encontrar lo que buscás.</p>
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
