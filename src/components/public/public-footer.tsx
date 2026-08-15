import Link from "next/link";
import { Clock, Instagram, MapPin, MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { BusinessSettings } from "@/types/database";

export function PublicFooter({ settings }: { settings: BusinessSettings }) {
  const whatsappUrl = settings.business_open && settings.whatsapp_number
    ? buildWhatsAppUrl(settings.whatsapp_number, settings.whatsapp_default_message)
    : null;

  return (
    <footer className="public-footer">
      <div className="container footer-grid">
        <div className="footer-info">
          <h3>Encontranos</h3>
          {settings.address && (
            <p><MapPin size={18} aria-hidden="true" /> {settings.address}</p>
          )}
          {settings.opening_hours && (
            <p><Clock size={18} aria-hidden="true" /> {settings.opening_hours}</p>
          )}
        </div>
        <div className="footer-links">
          <h3>Menú</h3>
          <Link href="/catalogo">Catálogo</Link>
          <Link href="/#recomendados">Recomendados de la casa</Link>
        </div>
        <div className="footer-info">
          <h3>Seguinos</h3>
          {settings.instagram_url && (
            <a className="footer-social" href={settings.instagram_url} target="_blank" rel="noreferrer">
              <Instagram size={18} aria-hidden="true" /> Instagram
            </a>
          )}
          {whatsappUrl && (
            <a className="footer-social" href={whatsappUrl} target="_blank" rel="noreferrer">
              <MessageCircle size={18} aria-hidden="true" /> WhatsApp
            </a>
          )}
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()}</span>
        <span>Comida casera · comida feliz</span>
      </div>
    </footer>
  );
}
