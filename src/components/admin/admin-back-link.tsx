"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * En /admin (el panel general) no hace falta un link para volver a donde ya
 * estamos. En cualquier sección adentro (productos, categorías, etc.) muestra
 * el camino de vuelta.
 */
export function AdminBackLink() {
  const pathname = usePathname();
  if (pathname === "/admin") return null;
  return <Link href="/admin" className="brand">← Volver al panel general</Link>;
}
