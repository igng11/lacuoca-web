"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { CartWidget } from "@/components/public/cart-widget";
import { FloatingDock } from "@/components/public/floating-dock";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { BusinessSettings } from "@/types/database";

export function SiteHeader({ current, settings }: { current?: "home" | "catalog"; settings?: BusinessSettings }) {
  const isCatalog = current === "catalog";
  const whatsappUrl = settings?.whatsapp_number ? buildWhatsAppUrl(settings.whatsapp_number, settings.whatsapp_default_message) : null;
  const [menuOpen, setMenuOpen] = useState(false);

  // En /catalogo estos links navegan de verdad a la home con el hash; solo en
  // home hacen scroll-anchor. En los dos casos el menú mobile se cierra.
  const scrollTo = (id: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    setMenuOpen(false);
    if (!isCatalog) {
      event.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return <header className="public-header">
    <div className="container public-header-inner">
      <Link href="/" className="brand" aria-label={settings?.business_name} onClick={(event) => {
        setMenuOpen(false);
        if (!isCatalog) {
          event.preventDefault();
          document.getElementById("hero")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }}>
        {settings?.logo_url
          ? <span className="brand-logo-wrap"><Image className="brand-logo" src={settings.logo_url} alt={settings.business_name || ""} fill sizes="200px" priority /></span>
          : <span className="brand-name">{settings?.business_name || "La Cuoca"}</span>}
      </Link>

      <nav id="public-nav" className={`public-nav${menuOpen ? " is-open" : ""}`}>
        <a className="nav-link" href={isCatalog ? "/#como-pedir" : "#como-pedir"} onClick={scrollTo("como-pedir")}>Cómo pedir</a>
        <Link href="/catalogo" className="nav-link" onClick={() => setMenuOpen(false)}>Catálogo</Link>
        <a className="nav-link" href={isCatalog ? "/#nosotros" : "#nosotros"} onClick={scrollTo("nosotros")}>Nosotros</a>
        {whatsappUrl && <a className="nav-link nav-whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}>Contacto</a>}
      </nav>

      <div className="header-actions">
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={menuOpen}
          aria-controls="public-nav"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
        <CartWidget settings={settings} />
      </div>
    </div>
    <FloatingDock settings={settings} />
  </header>;
}
