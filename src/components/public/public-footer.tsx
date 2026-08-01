import { Clock3, Instagram, MapPin } from "lucide-react";
import Link from "next/link";
import type { BusinessSettings } from "@/types/database";

export function PublicFooter({ settings }: { settings: BusinessSettings }) {
  return (
    <footer className="public-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <span className="eyebrow footer-eyebrow">Cocina artesanal</span>
          <h2>{settings.business_name}</h2>
          {settings.description && <p>{settings.description}</p>}
        </div>
        <div className="footer-links">
          <h3>Explorá</h3>
          <Link href="/">Inicio</Link>
          <Link href="/catalogo">Catálogo</Link>
          {settings.instagram_url && (
            <a href={settings.instagram_url} target="_blank" rel="noreferrer">
              <Instagram size={17} aria-hidden="true" /> Instagram
            </a>
          )}
        </div>
        <div className="footer-info">
          <h3>Información</h3>
          {settings.opening_hours && <p><Clock3 size={18} aria-hidden="true" />{settings.opening_hours}</p>}
          {settings.address && <p><MapPin size={18} aria-hidden="true" />{settings.address}</p>}
          {!settings.opening_hours && !settings.address && <p>Los datos de atención se agregarán próximamente.</p>}
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {settings.business_name}</span>
        <span>Catálogo online</span>
      </div>
    </footer>
  );
}
