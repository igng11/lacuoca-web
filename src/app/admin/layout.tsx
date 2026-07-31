import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/supabase/admin";
import { logout } from "./actions";

export const metadata: Metadata = {
  title: "Administración",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({children}:{children:React.ReactNode}){
 await requireAdmin();
 return <div className="admin-shell"><header className="admin-nav"><div className="admin-nav-inner"><Link href="/admin" className="brand">Panel simple</Link><div style={{display:"flex",gap:".4rem"}}><Link className="btn btn-soft" href="/" target="_blank">Ver sitio</Link><form action={logout}><button className="btn btn-soft">Salir</button></form></div></div></header><main className="admin-main">{children}</main></div>;
}
