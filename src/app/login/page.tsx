import Link from "next/link";
import { login } from "./actions";
import { hasSupabaseEnv } from "@/lib/env";

export const metadata={title:"Acceso administrativo",robots:{index:false,follow:false,nocache:true}};
export default async function LoginPage({searchParams}:{searchParams:Promise<{error?:string}>}){
  const {error}=await searchParams; const configured=hasSupabaseEnv();
  return <main className="container" style={{minHeight:"100vh",display:"grid",placeItems:"center",paddingBlock:"2rem"}}><section className="card stack" style={{width:"min(100%,420px)",padding:"clamp(1.25rem,5vw,2rem)"}}>
    <div><span className="eyebrow">Panel privado</span><h1>Hola de nuevo</h1><p className="muted">Ingresá con el usuario administrador.</p></div>
    {!configured&&<p className="notice">Primero configurá las variables de Supabase en <code>.env.local</code>.</p>}
    {error&&<p className="notice" role="alert">{error}</p>}
    <form action={login} className="stack">
      <div className="field"><label htmlFor="email">Email</label><input className="input" id="email" name="email" type="email" autoComplete="email" required/></div>
      <div className="field"><label htmlFor="password">Contraseña</label><input className="input" id="password" name="password" type="password" autoComplete="current-password" minLength={6} required/></div>
      <button type="submit" className="btn btn-primary" disabled={!configured}>Ingresar</button>
    </form><Link href="/" style={{textAlign:"center"}}>← Volver al sitio</Link>
  </section></main>;
}
