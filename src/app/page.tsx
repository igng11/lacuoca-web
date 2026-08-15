import Image from "next/image";
import Link from "next/link";
import { AboutCarousel } from "@/components/public/about-carousel";
import { RoughFrame } from "@/components/rough-frame";
import { ABOUT_FRAME } from "@/data/rough-frame-path";
import { CommentsSection } from "@/components/public/comments-section";
import { HeroArch } from "@/components/public/hero-arch";
import recursoOlla from "@/assets/img/Recurso 11.png";
import { ProductCard } from "@/components/public/product-card";
import { PublicFooter } from "@/components/public/public-footer";
import { SiteHeader } from "@/components/public/site-header";
import { WhatsAppButton } from "@/components/public/whatsapp-button";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { getProducts, getSettings } from "@/services/catalog";

export const metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [settings, allProducts] = await Promise.all([getSettings(), getProducts()]);
  const featured = allProducts.filter((product) => product.featured);
  const visibleProducts = (featured.length ? featured : allProducts).slice(0, 6);
  const aboutPhotos = [settings.about_photo_1_url, settings.about_photo_2_url, settings.about_photo_3_url].filter((photo): photo is string => Boolean(photo));
  const wa = settings.whatsapp_number ? buildWhatsAppUrl(settings.whatsapp_number, settings.whatsapp_default_message) : null;

  return <>
    <SiteHeader current="home" settings={settings} />
    <main className="public-main">

      {/* HERO */}
      <section id="hero" className="hero-editorial">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span className={`status-dot ${settings.business_open ? "is-open" : ""}`} aria-hidden="true" />
              {settings.business_open ? "Hacé tu pedido" : "Consultas pausadas por el momento"}
            </div>
            <h1>Tu vianda diaria, con la frescura de lo recien hecho.</h1>
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

      {/* INTRO */}
      <section id="recomendados" className="text-block">
        <Image className="text-block-pot" src={recursoOlla} alt="" priority={false} />
        <div className="curved-text-placeholder">Una primera selección</div>
        <h2>Recomendados de la casa</h2>
        <p>Preparaciones caseras para resolver una comida rica o compartir algo especial.</p>
        <Link href="/catalogo" className="btn">Ver catálogo</Link>
      </section>

      {/* GALERÍA */}
      <section className="public-section featured-section">
        <div className="container">
          {visibleProducts.length
            ? <div className="product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} settings={settings} />)}</div>
            : <div className="empty public-empty"><h3>Estamos preparando el catálogo</h3><p>Los primeros productos van a aparecer acá apenas estén publicados.</p></div>}
        </div>
      </section>

      <div className="divider blue" />

      {/* NOSOTROS */}
      <section id="nosotros" className="public-section about-section">
        <div className="container about-grid">
          <div className="about-media">
            {aboutPhotos.length
              ? <AboutCarousel photos={aboutPhotos} />
              : <><Image src="/img/nos.jpg" alt="Nosotros" fill sizes="(max-width: 760px) 100vw, 50vw" /><RoughFrame shape={ABOUT_FRAME} /></>}
          </div>
          <div className="about-copy">
            <h2 className="section-title about-title">De la olla a tu mesa</h2>
            <p className="about-text about-foundation">Nacimos en 2014 con una olla humeante y muchas ganas de cocinar.</p>
            <div className="about-story" tabIndex={0} aria-label="Nuestra historia">
              <p className="about-text">Soy cocinera hace muchos años. Después de trabajar por Europa y por distintos lugares acá en Argentina, y ya siendo mamá, tuve ganas de volver a mis raíces: abrir un lugar en Florida, mi barrio de toda la vida. Muchos me sugirieron otros lugares, pero para mí el barrio siempre fue el punto de partida.</p>
              <p className="about-text">Después de buscar mucho, encontré este local que durante años había sido una casa de empanadas. Apenas entré me enamoré: una casa luminosa, ventilada, con esa calidez que pocos locales tienen. Fue en marzo de 2014 cuando el lugar pasó a ser mío, y desde entonces estamos en las callecitas tranquilas del barrio, vendiéndole a los vecinos, a oficinas y a quienes se van cruzando en el camino. Por el camino tuve socios que me acompañaron —Guille primero, Adri después— y hoy sigo sola, con toda mi alma puesta en esto.</p>
              <p className="about-text">El nombre, La Cuoca, viene de mi apellido de origen italiano, Cuocante. Quería algo que me representara de verdad, sin caer en los clásicos &ldquo;Casa de...&rdquo; o &ldquo;Taller de...&rdquo;. Algunos todavía me dicen &ldquo;La Cuca&rdquo; o &ldquo;La Coca&rdquo;, y hasta descubrí después que a dos cuadras hay un kiosco llamado El Cuco. Cosas del barrio.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="divider blue" />

      {/* COMENTARIOS */}
      <CommentsSection />
    </main>
    <PublicFooter settings={settings} />
  </>;
}