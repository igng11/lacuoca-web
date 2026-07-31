"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { loginSchema } from "@/lib/validation/schemas";
import { formString } from "@/lib/forms";

export async function login(data: FormData) {
  if (!hasSupabaseEnv()) redirect("/login?error=Falta%20configurar%20Supabase.");
  const parsed = loginSchema.safeParse({ email:formString(data,"email"), password:formString(data,"password") });
  if (!parsed.success) redirect(`/login?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  const supabase = await createClient();
  let authError: { status?: number } | null = null;
  try {
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    authError = error;
  } catch {
    redirect("/login?error=No%20pudimos%20conectarnos%20al%20servicio.%20Revis%C3%A1%20tu%20conexi%C3%B3n%20e%20intent%C3%A1%20nuevamente.");
  }
  if (authError) {
    const message = authError.status && authError.status >= 500
      ? "El servicio de acceso no está disponible temporalmente. Intentá nuevamente en unos minutos."
      : "El email o la contraseña son incorrectos.";
    redirect(`/login?error=${encodeURIComponent(message)}`);
  }
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle()
    : { data: null };
  if (!profile) {
    await supabase.auth.signOut();
    redirect("/login?error=Tu%20usuario%20no%20est%C3%A1%20autorizado%20para%20administrar.");
  }
  redirect("/admin");
}
