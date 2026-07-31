import Link from "next/link";
import { ProductCard } from "@/components/public/product-card";
import { SiteHeader } from "@/components/public/site-header";
import { getCategories, getProducts, getSettings } from "@/services/catalog";

export const metadata = { title: "Catálogo", alternates: { canonical: "/catalogo" } };
export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;
  const [settings, categories, products] = await Promise.all([getSettings(), getCategories(), getProducts({ category:categoria })]);
  return <><SiteHeader settings={settings} current="catalog"/><main className="container section catalog-page">
    <span className="eyebrow">Todo lo rico, en un lugar</span><h1 className="page-title">Catálogo</h1>
    <p className="muted">Elegí una categoría o explorá todos nuestros productos.</p>
    <nav className="filters catalog-filters" aria-label="Categorías"><Link className={`filter ${!categoria?"active":""}`} aria-current={!categoria ? "page" : undefined} href="/catalogo">Todos</Link>{categories.map(c=><Link key={c.id} className={`filter ${categoria===c.slug?"active":""}`} aria-current={categoria === c.slug ? "page" : undefined} href={`/catalogo?categoria=${c.slug}`}>{c.name}</Link>)}</nav>
    {products.length ? <div className="grid-cards">{products.map(p=><ProductCard key={p.id} product={p} settings={settings}/>)}</div> : <div className="empty"><h2>No encontramos productos</h2><p className="muted">Probá con otra categoría o volvé más tarde.</p></div>}
  </main></>;
}
