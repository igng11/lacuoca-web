import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/supabase/admin";
import { logout } from "./actions";
import { AdminBackLink } from "@/components/admin/admin-back-link";
import { FormSubmitButton } from "@/components/admin/form-submit-button";

export const metadata: Metadata = {
  title: "Administración",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({children}:{children:React.ReactNode}){
 await requireAdmin();
 return <div className="admin-shell"><header className="admin-nav"><div className="admin-nav-inner"><AdminBackLink /><div className="admin-nav-actions"><Link className="btn btn-soft" href="/" target="_blank">Ver sitio</Link><form action={logout}><FormSubmitButton variant="soft" pendingText="Saliendo…">Salir</FormSubmitButton></form></div></div></header><main className="admin-main">{children}</main></div>;
}
