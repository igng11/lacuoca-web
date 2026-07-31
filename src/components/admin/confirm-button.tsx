"use client";
export function ConfirmButton({label="Eliminar"}:{label?:string}){return <button type="submit" className="btn btn-danger" onClick={e=>{if(!confirm("¿Seguro que querés eliminarlo? Esta acción no se puede deshacer."))e.preventDefault()}}>{label}</button>}
