import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HeartHandshake, Leaf, UtensilsCrossed } from "lucide-react";
import { ProductCard } from "@/components/public/product-card";
import { PublicFooter } from "@/components/public/public-footer";
import { SiteHeader } from "@/components/public/site-header";
import { WhatsAppButton } from "@/components/public/whatsapp-button";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { getCategories, getProducts, getSettings } from "@/services/catalog";

export const metadata = { alternates: { canonical: "/" } };

const provisionalAbout = "Una propuesta de cocina cercana, con preparaciones pensadas para disfrutar en casa y compartir.";

export default async function HomePage() {
  const [settings, categories, allProducts] = await Promise.all([getSettings(), getCategories(), getProducts()]);
  const categoryIdsWithProducts = new Set(allProducts.map((product) => product.category_id));
  const publishedCategories = categories.filter((category) => categoryIdsWithProducts.has(category.id));
  const featured = allProducts.filter((product) => product.featured);
  const visibleProducts = (featured.length ? featured : allProducts).slice(0, 6);
  const heroProduct = allProducts.find((product) => product.image_url);
  const heroImage = settings.hero_image_url || heroProduct?.image_url || "/placeholder.svg";
  const usesPlaceholder = !settings.hero_image_url && !heroProduct?.image_url;
  const wa = settings.whatsapp_number ? buildWhatsAppUrl(settings.whatsapp_number, settings.whatsapp_default_message) : null;

  return <>
    <SiteHeader settings={settings} current="home" />
    <main className="public-main">
      <section className="hero-editorial">
        <div className="container hero-editorial-grid">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span className={`status-dot ${settings.business_open ? "is-open" : ""}`} aria-hidden="true" />
              {settings.business_open ? "Tomando pedidos" : "Consultas pausadas por el momento"}
            </div>
            <p className="hero-brand">{settings.business_name}</p>
            <h1>{settings.hero_title}</h1>
            {settings.hero_subtitle && <p className="hero-lede">{settings.hero_subtitle}</p>}
            <div className="hero-actions">
              <Link href="/catalogo" className="btn btn-primary">Ver catálogo <ArrowRight size={18} aria-hidden="true" /></Link>
              {settings.business_open && <WhatsAppButton href={wa} label="Hacer una consulta" />}
            </div>
          </div>
          <div className={`hero-media ${usesPlaceholder ? "uses-placeholder" : ""}`}>
            <div className="hero-media-frame">
              <Image src={heroImage} alt={usesPlaceholder ? "Imagen gastronómica próximamente" : `Propuesta gastronómica de ${settings.business_name}`} fill priority sizes="(max-width: 760px) 90vw, 48vw" />
            </div>
            <div className="hero-media-note"><UtensilsCrossed size={17} aria-hidden="true" /><span>Hecho con dedicación</span></div>
          </div>
        </div>
      </section>

      <section className="container public-section category-section">
        <div className="section-heading-row">
          <div><span className="eyebrow">Para elegir</span><h2 className="section-title">Explorá por categoría</h2></div>
          <Link className="section-link" href="/catalogo">Ver todo <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
        {publishedCategories.length
          ? <div className="category-grid">{publishedCategories.slice(0, 6).map((category, index) => <Link className="category-tile" key={category.id} href={`/catalogo?categoria=${category.slug}`}><span>0{index + 1}</span><strong>{category.name}</strong><ArrowRight size={18} aria-hidden="true" /></Link>)}</div>
          : <div className="empty public-empty"><h3>El menú está en preparación</h3><p>Muy pronto vas a poder recorrer nuestras categorías.</p></div>}
      </section>

      <section className="public-section featured-section">
        <div className="container">
          <div className="section-heading-row">
            <div><span className="eyebrow">Una primera selección</span><h2 className="section-title">Recomendados de la casa</h2></div>
            <p className="section-intro">Preparaciones caseras para resolver una comida rica o compartir algo especial.</p>
          </div>
          {visibleProducts.length
            ? <div className="product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} settings={settings} />)}</div>
            : <div className="empty public-empty"><h3>Estamos preparando el catálogo</h3><p>Los primeros productos van a aparecer acá apenas estén publicados.</p></div>}
        </div>
      </section>

      <section className="container public-section story-section">
        <div className="story-card">
          <div className="story-copy">
            <span className="eyebrow">Nuestra manera de cocinar</span>
            <h2 className="section-title">Comida casera, simple y bien hecha</h2>
            <p>{settings.description || provisionalAbout}</p>
          </div>
          <div className="story-values">
            <div><Leaf size={22} aria-hidden="true" /><strong>Ingredientes elegidos</strong><span>Una selección cuidada para cada preparación.</span></div>
            <div><HeartHandshake size={22} aria-hidden="true" /><strong>Atención cercana</strong><span>Consultas directas y simples por WhatsApp.</span></div>
          </div>
        </div>
      </section>

      <section className="container public-section cta-section">
        <div className="cta-card">
          <div><span className="eyebrow">¿Ya sabés qué elegir?</span><h2>Conocé el menú y consultanos cuando quieras.</h2></div>
          <div className="cta-actions"><Link href="/catalogo" className="btn btn-primary">Explorar catálogo</Link>{settings.business_open && <WhatsAppButton href={wa} />}</div>
        </div>
      </section>
    </main>
    <PublicFooter settings={settings} />
  </>;
}
