"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
export function ImageInput({id,name,label,current}:{id?:string;name:string;label:string;current?:string|null}){
 const [preview,setPreview]=useState(current||"");
 const [objectUrl,setObjectUrl]=useState("");
 const [error,setError]=useState("");
 useEffect(()=>()=>{if(objectUrl)URL.revokeObjectURL(objectUrl)},[objectUrl]);
 const inputId=id||name;
 const helpId=`${inputId}-help`;
 return <div className="field"><label htmlFor={inputId}>{label}</label>{preview&&<Image src={preview} alt="Vista previa" width={240} height={160} style={{objectFit:"cover",borderRadius:12}}/>}<input className="input" id={inputId} name={name} type="file" accept="image/jpeg,image/png,image/webp" aria-describedby={helpId} onChange={e=>{const f=e.target.files?.[0];setError("");if(!f)return;if(f.size>5*1024*1024){setError("La imagen no puede superar 5 MB.");e.currentTarget.value="";return}const next=URL.createObjectURL(f);setObjectUrl(next);setPreview(next)}}/><small id={helpId} className={error?"field-error":"muted"}>{error||"JPG, PNG o WebP. Máximo 5 MB."}</small></div>
}
