import Image from "next/image";
import Link from "next/link";
import { AboutCarousel } from "@/components/public/about-carousel";
import { RoughFrame } from "@/components/rough-frame";
import { ABOUT_FRAME, CARD_FRAME } from "@/data/rough-frame-path";
import { CommentsSection } from "@/components/public/comments-section";
import { HeroArch } from "@/components/public/hero-arch";
import recursoOlla from "@/assets/img/abierto@3x.png";
import { ProductCard } from "@/components/public/product-card";
import { PublicFooter } from "@/components/public/public-footer";
import { SiteHeader } from "@/components/public/site-header";
import { WhatsAppButton } from "@/components/public/whatsapp-button";
import { formatPrice } from "@/lib/format";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { getProducts, getSettings } from "@/services/catalog";

export const metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [settings, allProducts] = await Promise.all([getSettings(), getProducts()]);
  const featured = allProducts.filter((product) => product.featured);
  const visibleProducts = (featured.length ? featured : allProducts).slice(0, 6);
  const aboutPhotos = [settings.about_photo_1_url, settings.about_photo_2_url, settings.about_photo_3_url].filter((photo): photo is string => Boolean(photo));
  const wa = settings.whatsapp_number ? buildWhatsAppUrl(settings.whatsapp_number, settings.whatsapp_default_message) : null;
  const availablePrices = allProducts.filter((product) => product.available && product.price > 0).map((product) => product.price);
  const priceFrequency = availablePrices.reduce((counts, price) => counts.set(price, (counts.get(price) || 0) + 1), new Map<number, number>());
  const individualPrice = [...priceFrequency.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0]?.[0];
  const comboPrice = individualPrice ? individualPrice * 5 * 0.75 : null;

  return <>
    <SiteHeader current="home" settings={settings} />
    <main className="public-main">

      {/* HERO */}
      <section id="hero" className="hero-editorial">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="hero-kicker">{settings.hero_title}</p>
            <h1>{settings.hero_subtitle || settings.hero_title}</h1>
            <div className="hero-actions">
              <Link href="/catalogo" className="btn btn-primary">Ver catálogo</Link>
              {settings.business_open && wa && <WhatsAppButton href={wa} label="Hacer una consulta" />}
            </div>
          </div>
          <div className="hero-media-frame">
            <HeroArch src={settings.hero_image_url || "/placeholder.svg"} alt={settings.business_name} />
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* CÓMO PEDIR */}
      <section id="como-pedir" className="public-section how-to-section">
        <div className="container">
          <p className="how-to-subtitle">Así de simple. Sin cocinar, sin vueltas.</p>
          <h2 className="section-title">¿Cómo pedís tus viandas?</h2>
          <ol className="how-to-steps">
            <li className="how-to-step">
              <span className="how-to-number">1</span>
              <h3>Elegí tus viandas</h3>
              <p>Recorré el catálogo y armá tu pedido: sueltas o el pack semanal completo. Elegís sabor y cantidad de cada una.</p>
            </li>
            <li className="how-to-step">
              <span className="how-to-number">2</span>
              <h3>Nos escribís por WhatsApp</h3>
              <p>Tu selección se convierte en un mensaje armado. Coordinamos y confirmamos día de entrega.</p>
            </li>
            <li className="how-to-step">
              <span className="how-to-number">3</span>
              <h3>Cocinamos y entregamos</h3>
              <p>Vero cocina fresco para tu pedido. Te lo llevamos el día acordado.</p>
            </li>
            <li className="how-to-step">
              <span className="how-to-number">4</span>
              <h3>Listas para comer</h3>
              <p>Solo calentar y disfrutar. Comida casera de verdad, sin que vos tengas que cocinar.</p>
            </li>
          </ol>
        </div>
      </section>

      <div className="divider" />

      {/* INTRO */}
      <section id="recomendados" className="text-block">
        <Image className="text-block-pot" src={recursoOlla} alt="" priority={false} />
        <div className="curved-text-placeholder">Una primera selección</div>
        <h2>Recomendados de la casa</h2>
        <p>Preparaciones caseras para resolver una comida rica o compartir algo especial.</p>
        {settings.show_prices && individualPrice && comboPrice && (
          <div className="catalog-price-options home-price-options" aria-label="Precios de las viandas">
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
      </section>

      {/* GALERÍA */}
      <section className="public-section featured-section">
        <div className="container">
          {visibleProducts.length
            ? <div className="product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} settings={settings} />)}</div>
            : <div className="empty public-empty"><h3>Estamos preparando el catálogo</h3><p>Los primeros productos van a aparecer acá apenas estén publicados.</p></div>}
          <div className="featured-cta">
            <Link href="/catalogo" className="btn btn-primary">Ver catálogo completo</Link>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* NOSOTROS */}
      <section id="nosotros" className="public-section about-section">
        <div className="container about-grid">
          <div className="about-media">
            {aboutPhotos.length
              ? <AboutCarousel photos={aboutPhotos} />
              : <><Image src="/img/nos.jpg" alt="Nosotros" fill sizes="(max-width: 760px) 100vw, 50vw" /><RoughFrame shape={ABOUT_FRAME} /></>}
          </div>
          <div className="about-copy">
            <h2 className="section-title about-title">Nuestra historia</h2>
            <p className="about-text about-foundation">Hola, soy Vero, cocinera y mamá de Felipe.</p>
            <div className="about-story" tabIndex={0} aria-label="Nuestra historia">
              <p className="about-text">Estudié Educación Física y Recreación durante varios años, pero en medio de mis búsquedas encontré en la cocina mi pasión. Empecé mis estudios en el IAG y ya no paré.</p>
              <p className="about-text">Me fui a vivir a España por un año y terminé quedándome siete, trabajando allá. Cuando fui mamá, decidí volver a mis raíces y abrir mi propio lugar acá, en Florida, mi barrio de siempre.</p>
              <p className="about-text">Encontré este local, que antes había sido una casa de empanadas, y así nació La Cuoca Comidas Caseras. Durante un tiempo me acompañó Guille, después Adri, y actualmente sigo sola. Ya van 14 años en las callecitas tranquilas del mejor barrio.</p>
              <p className="about-text">Te invito a conocernos y a llevar mi alegría a tu mesa.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* COMENTARIOS */}
      <CommentsSection />
    </main>
    <PublicFooter settings={settings} />
  </>;
}
