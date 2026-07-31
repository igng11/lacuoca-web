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
  if (!hasSupabaseEnv()) redirect("/login?error=Falta%20configurar%20Supabase.");
  const supabase = await getAdminClient();
  if (!supabase) redirect("/login?error=No%20ten%C3%A9s%20acceso%20administrativo.");
  return supabase;
}
