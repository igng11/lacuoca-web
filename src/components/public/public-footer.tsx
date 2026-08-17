import { Clock, Instagram, MapPin, MessageCircle } from "lucide-react";
import { RoughFrame } from "@/components/rough-frame";
import { CARD_FRAME } from "@/data/rough-frame-path";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { BusinessSettings } from "@/types/database";

export function PublicFooter({ settings }: { settings: BusinessSettings }) {
  const whatsappUrl = settings.business_open && settings.whatsapp_number
    ? buildWhatsAppUrl(settings.whatsapp_number, settings.whatsapp_default_message)
    : null;

  return (
    <footer className="public-footer">
      <div className="container footer-grid">
        <div className="footer-card footer-card-find">
          <RoughFrame shape={CARD_FRAME} color="var(--red)" />
          <span className="footer-card-tag">Encontranos</span>
          {settings.address && (
            <p><MapPin size={28} aria-hidden="true" /> {settings.address}</p>
          )}
          {settings.opening_hours && (
            <p><Clock size={28} aria-hidden="true" /> {settings.opening_hours}</p>
          )}
        </div>
        <div className="footer-card footer-card-contact">
          <RoughFrame shape={CARD_FRAME} color="var(--blue)" />
          <span className="footer-card-tag">Contacto</span>
          {whatsappUrl && (
            <a className="footer-social" href={whatsappUrl} target="_blank" rel="noreferrer">
              <MessageCircle size={28} aria-hidden="true" /> WhatsApp
            </a>
          )}
          {settings.instagram_url && (
            <a className="footer-social" href={settings.instagram_url} target="_blank" rel="noreferrer">
              <Instagram size={28} aria-hidden="true" /> Instagram
            </a>
          )}
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© La Cuoca {new Date().getFullYear()} - Todos los derechos reservados.</span>
        <span>Comida casera · comida feliz</span>
      </div>
    </footer>
  );
}
