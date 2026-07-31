import Image from "next/image";
import Link from "next/link";
import type { BusinessSettings } from "@/types/database";

export function SiteHeader({ settings }: { settings: BusinessSettings }) {
  return <header className="container public-header">
    <Link href="/" className="brand" aria-label={settings.business_name}>
      <Image src={settings.logo_url || "/placeholder.svg"} alt="" width={42} height={42} />
      <span className="brand-name">{settings.business_name}</span>
    </Link>
    <nav aria-label="Navegación principal" style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <Link href="/catalogo">Catálogo</Link>
      <Link className="btn btn-soft" href="/admin">Admin</Link>
    </nav>
  </header>;
}
