import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function getAdminClient() {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  return profileError || !profile ? null : supabase;
}

export async function requireAdmin() {
  if (!hasSupabaseEnv()) {
    redirect("/login?error=Falta%20configurar%20la%20conexi%C3%B3n%20del%20panel.");
  }
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect("/login?error=Tu%20sesi%C3%B3n%20venci%C3%B3.%20Ingres%C3%A1%20nuevamente.");
  }
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) {
    redirect("/login?error=El%20servicio%20no%20est%C3%A1%20disponible%20temporalmente.%20Intent%C3%A1%20nuevamente.");
  }
  if (!profile) {
    await supabase.auth.signOut();
    redirect("/login?error=Tu%20usuario%20no%20tiene%20permisos%20administrativos.");
  }
  return supabase;
}
