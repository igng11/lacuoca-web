import Link from "next/link";
import { login } from "./actions";
import { hasSupabaseEnv } from "@/lib/env";
import { Feedback } from "@/components/admin/feedback";
import { FormSubmitButton, PendingFormFields } from "@/components/admin/form-submit-button";

export const metadata={title:"Acceso administrativo",robots:{index:false,follow:false,nocache:true}};
export default async function LoginPage({searchParams}:{searchParams:Promise<{error?:string}>}){
  const {error}=await searchParams; const configured=hasSupabaseEnv();
  return <main className="container" style={{minHeight:"100vh",display:"grid",placeItems:"center",paddingBlock:"2rem"}}><section className="card stack" style={{width:"min(100%,420px)",padding:"clamp(1.25rem,5vw,2rem)"}}>
    <div><span className="eyebrow">Panel privado</span><h1>Hola de nuevo</h1><p className="muted">Ingresá con el usuario administrador.</p></div>
    {!configured&&<Feedback error="Falta configurar la conexión del panel. Pedile ayuda a la persona responsable del sitio."/>}
    {configured && <Feedback error={error} />}
    <form action={login} className="stack">
      <PendingFormFields>
      <div className="field"><label htmlFor="email">Email</label><input className="input" id="email" name="email" type="email" autoComplete="email" required/></div>
      <div className="field"><label htmlFor="password">Contraseña</label><input className="input" id="password" name="password" type="password" autoComplete="current-password" minLength={6} required/></div>
      <FormSubmitButton pendingText="Ingresando…" disabled={!configured} fullWidth>Ingresar</FormSubmitButton>
      </PendingFormFields>
    </form><Link href="/" style={{textAlign:"center"}}>← Volver al sitio</Link>
  </section></main>;
}
