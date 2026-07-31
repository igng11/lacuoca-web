import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/public/product-card";
import { SiteHeader } from "@/components/public/site-header";
import { WhatsAppButton } from "@/components/public/whatsapp-button";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { getCategories, getProducts, getSettings } from "@/services/catalog";

export const metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [settings, categories, products] = await Promise.all([getSettings(), getCategories(), getProducts({ featured:true })]);
  const wa = settings.whatsapp_number ? buildWhatsAppUrl(settings.whatsapp_number, settings.whatsapp_default_message) : null;
  return <>
    <SiteHeader settings={settings} current="home" />
    <main>
      <section className="hero">
        {settings.hero_image_url && <Image className="hero-image" src={settings.hero_image_url} alt="" fill priority sizes="100vw" />}
        <div className="container hero-content">
          <span className="eyebrow hero-eyebrow">{settings.business_open ? "Estamos abiertos" : "Por el momento estamos cerrados"}</span>
          <h1>{settings.hero_title}</h1>
          <p className="hero-lede">{settings.hero_subtitle}</p>
          <div className="hero-actions">
            <Link href="/catalogo" className="btn btn-primary">Ver catálogo</Link>
            {settings.business_open && <WhatsAppButton href={wa} />}
          </div>
        </div>
      </section>
      <section className="container section">
        <span className="eyebrow">Para elegir</span><h2 className="section-title">Nuestras categorías</h2>
        {categories.length
          ? <div className="filters">{categories.map(c => <Link className="filter" key={c.id} href={`/catalogo?categoria=${c.slug}`}>{c.name}</Link>)}</div>
          : <div className="empty"><p className="muted">Todavía no hay categorías publicadas.</p></div>}
      </section>
      <section className="container section section-compact-top">
        <span className="eyebrow">Recomendados</span><h2 className="section-title">Productos destacados</h2>
        {products.length ? <div className="grid-cards">{products.map(p => <ProductCard key={p.id} product={p} settings={settings} />)}</div>
          : <div className="empty"><h3>Muy pronto vas a encontrar nuestras especialidades</h3><p className="muted">Todavía no hay productos destacados publicados.</p></div>}
      </section>
      <footer className="section public-footer"><div className="container footer-grid">
        <div><span className="eyebrow footer-eyebrow">Sobre nosotros</span><h2>{settings.business_name}</h2><p>{settings.description}</p></div>
        <div><h3>Información</h3>{settings.opening_hours && <p>🕐 {settings.opening_hours}</p>}{settings.address && <p>📍 {settings.address}</p>}{settings.instagram_url && <a className="footer-link" href={settings.instagram_url} target="_blank" rel="noreferrer">Seguinos en Instagram →</a>}</div>
      </div></footer>
    </main>
  </>;
}
