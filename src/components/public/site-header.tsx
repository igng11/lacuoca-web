"use client";

import Link from "next/link";
import Image from "next/image";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { BusinessSettings } from "@/types/database";

export function SiteHeader({ current, settings }: { current?: "home" | "catalog"; settings?: BusinessSettings }) {
  const isCatalog = current === "catalog";
  const whatsappUrl = settings?.whatsapp_number ? buildWhatsAppUrl(settings.whatsapp_number, settings.whatsapp_default_message) : null;

  return <header className="public-header">
    <div className="container public-header-inner">
      <Link href="/" className="brand" aria-label={settings?.business_name} onClick={(event) => {
        if (!isCatalog) {
          event.preventDefault();
          document.getElementById("hero")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }}>
        {settings?.logo_url
          ? <span className="brand-logo-wrap"><Image className="brand-logo" src={settings.logo_url} alt={settings.business_name || ""} fill sizes="200px" /></span>
          : <span className="brand-name">{settings?.business_name || "La Cuoca"}</span>}
      </Link>
      <nav className="public-nav">
        <Link href={isCatalog ? "/" : "/catalogo"} className="nav-link" aria-current={current === "catalog" ? "page" : undefined}>
          {isCatalog ? "Inicio" : "Catálogo"}
        </Link>
        <a className="nav-link nav-recomendados" href={isCatalog ? "/#recomendados" : "#recomendados"} onClick={(event) => {
          if (!isCatalog) {
            event.preventDefault();
            document.getElementById("recomendados")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }}>Recomendados</a>
        <a className="nav-link nav-opiniones" href={isCatalog ? "/#comentarios" : "#comentarios"} onClick={(event) => {
          if (!isCatalog) {
            event.preventDefault();
            document.getElementById("comentarios")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }}>Opiniones</a>
        <a className="nav-link nav-nosotros" href={isCatalog ? "/#nosotros" : "#nosotros"} onClick={(event) => {
          if (!isCatalog) {
            event.preventDefault();
            document.getElementById("nosotros")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }}>Nosotros</a>
        {whatsappUrl && <a className="nav-link nav-whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer">Contacto</a>}
      </nav>
    </div>
  </header>;
}