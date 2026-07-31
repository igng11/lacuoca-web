import Link from "next/link";
import { Package, Tags, Store, CheckCircle } from "lucide-react";
import { requireAdmin } from "@/lib/supabase/admin";
export default async function AdminPage(){
 const s=await requireAdmin();const results=await Promise.all([s.from("products").select("id",{count:"exact",head:true}),s.from("categories").select("id",{count:"exact",head:true}),s.from("products").select("id",{count:"exact",head:true}).eq("available",true),s.from("products").select("id",{count:"exact",head:true}).eq("featured",true)]);
 if(results.some(result=>result.error))throw new Error("No se pudo cargar el resumen administrativo.");
 const [{count:products},{count:categories},{count:available},{count:featured}]=results;
 const links=[["/admin/productos","Productos","Crear, editar y ordenar",Package],["/admin/categorias","Categorías","Organizar el catálogo",Tags],["/admin/configuracion","Información del negocio","Datos, imágenes y colores",Store]] as const;
 return <div className="stack"><div><span className="eyebrow">Inicio</span><h1>¿Qué querés hacer?</h1><p className="muted">Todo lo importante está a un toque.</p></div><div className="grid-cards">{links.map(([href,title,text,Icon])=><Link className="card" style={{padding:"1.25rem"}} href={href} key={href}><Icon color="var(--primary)"/><h2 style={{fontSize:"1.1rem"}}>{title}</h2><p className="muted">{text}</p></Link>)}</div><h2>Resumen</h2><div className="grid-cards">{[["Productos",products],["Categorías",categories],["Disponibles",available],["Destacados",featured]].map(([label,count])=><div className="card" style={{padding:"1rem"}} key={label}><CheckCircle size={18} color="var(--secondary)"/><strong style={{fontSize:"1.8rem",display:"block"}}>{count??0}</strong><span className="muted">{label}</span></div>)}</div></div>
}
