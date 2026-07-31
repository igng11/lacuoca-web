import Image from "next/image";
import Link from "next/link";
import type { BusinessSettings } from "@/types/database";

export function SiteHeader({ settings, current }: { settings: BusinessSettings; current?: "home" | "catalog" }) {
  return <header className="public-header">
    <div className="container public-header-inner">
      <Link href="/" className="brand" aria-label={settings.business_name} aria-current={current === "home" ? "page" : undefined}>
        <Image src={settings.logo_url || "/placeholder.svg"} alt="" width={42} height={42} />
        <span className="brand-name">{settings.business_name}</span>
      </Link>
      <nav className="public-nav" aria-label="Navegación principal">
        <Link className="nav-link" href="/catalogo" aria-current={current === "catalog" ? "page" : undefined}>Catálogo</Link>
        <Link className="btn btn-soft nav-admin" href="/admin">Admin</Link>
      </nav>
    </div>
  </header>;
}
