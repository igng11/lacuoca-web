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
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) redirect("/login?error=Email%20o%20contrase%C3%B1a%20incorrectos.");
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
