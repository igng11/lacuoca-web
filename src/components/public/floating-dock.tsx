"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { BusinessSettings } from "@/types/database";

const noSubscription = () => () => {};

/**
 * El acceso flotante de WhatsApp se porta a document.body para que el
 * backdrop-filter del header no lo encierre dentro de su caja.
 *
 * document.body no existe en el render de servidor, así que el portal recién
 * puede montarse después de hidratar. useSyncExternalStore con snapshots
 * distintos para servidor/cliente evita el mismatch sin un useEffect+setState.
 */
export function FloatingDock({ settings }: { settings?: BusinessSettings }) {
  const isBrowser = useSyncExternalStore(noSubscription, () => true, () => false);

  const whatsappUrl = settings?.whatsapp_number
    ? buildWhatsAppUrl(settings.whatsapp_number, settings.whatsapp_default_message)
    : null;

  if (!isBrowser) return null;

  return createPortal(
    whatsappUrl ? (
      <a className="whatsapp-float" href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="Escribinos por WhatsApp">
        <MessageCircle size={34} aria-hidden="true" />
      </a>
    ) : null,
    document.body,
  );
}
