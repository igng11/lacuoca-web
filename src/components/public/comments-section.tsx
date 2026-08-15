"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Star } from "lucide-react";
import { RoughFrame } from "@/components/rough-frame";

const reviews = [
  { author: "RoD", time: "hace 7 meses", text: "Excelente la atención de Vero!! Muy rica la comida, gustito súper casero y buenos precios. RECOMENDABLE." },
  { author: "Karina Hidalgo", time: "hace 7 meses", text: "La comida es muy rica y casera. Se nota la dedicación en cada plato. Lo super recomiendo." },
  { author: "meri Mujica", time: "hace 10 meses", text: "Hay cosas simples como una sopa de calabaza y las empanadas de carne que en La Cuoca se convierten en sabores especialmente ricos. Detalles que hacen la diferencia y que querés volver a probar una y otra vez." },
  { author: "Fernando", time: "hace 4 años", text: "Es de esas perlas que da gusto conocer. Un pequeño lugar en una calle de Vicente López con una oferta cortita de platos pero todos ricos, sabrosos y a buen precio. Y sí, la atención de las chicas es lo máximo." },
  { author: "Ana Paula Calvo", time: "hace 4 años", text: "El mejor lugar para comer en Vicente López (y probablemente de la ciudad). Comida casera, cuidada, deliciosa; Vero y Adri súper amorosas, cálidas y atentas. Te llevas una rica comida y de seguro muchas sonrisas." },
  { author: "Daniela Oliva", time: "hace 1 año", text: "Exquisitos platos, las canastitas con roquefort son un placer, la tortilla una locura. ¡Ahh, el pastel de papas increíble!" },
  { author: "Delfina Forciniti", time: "hace 2 años", text: "La verdad una re linda experiencia. Más que a un negocio me sentí entrando a la casa de esta señora y llevándome un plato de comida de la calidad y el amor que una madre le daría a sus hijos. Definitivamente volveré pronto." },
  { author: "Maiten Lopez Duran", time: "hace 1 año", text: "Muy rico y muy lindo lugar, las chicas lo más! Los viernes de empanadas fritas 10/10." },
  { author: "Pablo Quiroga", time: "hace 4 años", text: "Súper cálidas y alegres las chicas que administran el lugar. Las empanadas fritas de los viernes son de primera. Muy recomendable." },
  { author: "Romina Faucheux", time: "hace 2 años", text: "Hoy comí el mejor pastel de carne desde mi infancia. Exquisito, igual que lo hacía mi abuela. Muy recomendado." },
];

const AUTOPLAY_MS = 4500;
const GOOGLE_REVIEWS_URL = "https://www.google.com/search?q=la+cuoca+comidas#lrd=0x95bcb6b6817e9de9:0x62109ea5aced27e0,1,,,,";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function CommentsSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  const step = useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    if (cards.length < 2) return;

    // El índice actual se lee del DOM, no de un estado: así el autoplay retoma
    // desde donde quedó si el visitante scrolleó a mano.
    const trackRect = track.getBoundingClientRect();
    let current = 0;
    let closest = Infinity;
    cards.forEach((card, i) => {
      const distance = Math.abs(card.getBoundingClientRect().left - trackRect.left);
      if (distance < closest) {
        closest = distance;
        current = i;
      }
    });

    // track.scrollTo (no scrollIntoView): scrollIntoView recorre TODOS los
    // ancestros con scroll, así que si la sección todavía no está en pantalla
    // cuando dispara el autoplay, terminaba scrolleando la página entera hacia
    // abajo. El delta se calcula en vivo con getBoundingClientRect (no con
    // offsetLeft, que asumía que la card 0 arranca siempre en scrollLeft 0).
    const next = (current + direction + cards.length) % cards.length;
    const delta = cards[next].getBoundingClientRect().left - trackRect.left;
    track.scrollTo({
      left: track.scrollLeft + delta,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, []);

  useEffect(() => {
    if (paused || prefersReducedMotion()) return;
    const id = window.setInterval(() => step(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, step]);

  return (
    <section id="comentarios" className="public-section comments-section">
      <div className="container">
        <div className="comments-heading">
          <div className="curved-text-placeholder">Opiniones de Google</div>
          <h2 className="section-title">Comentarios</h2>
          <p className="section-intro">Lo que dicen quienes ya probaron la comida de La Cuoca.</p>
        </div>

        <div
          className="comments-carousel"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
          onTouchCancel={() => setPaused(false)}
        >
          <div className="comments-track" ref={trackRef} tabIndex={0} aria-label="Comentarios de Google">
            {reviews.map((review) => (
              <figure className="card review-card" key={`${review.author}-${review.time}`}>
                <RoughFrame />
                <div className="review-stars" aria-label="5 de 5 estrellas">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={15} fill="currentColor" strokeWidth={0} aria-hidden="true" />)}
                </div>
                <blockquote className="review-text">{review.text}</blockquote>
                <figcaption className="review-author">
                  <strong>{review.author}</strong>
                  <span className="review-time">{review.time}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="comments-nav">
            <button type="button" className="comments-arrow" onClick={() => step(-1)} aria-label="Comentario anterior">
              <ChevronLeft size={28} aria-hidden="true" />
            </button>
            <button type="button" className="comments-arrow" onClick={() => step(1)} aria-label="Comentario siguiente">
              <ChevronRight size={28} aria-hidden="true" />
            </button>
          </div>
        </div>

        <a className="comments-google-link" href={GOOGLE_REVIEWS_URL} target="_blank" rel="noreferrer">
          <ExternalLink size={16} aria-hidden="true" /> Ver todas las reseñas en Google
        </a>
      </div>
    </section>
  );
}
