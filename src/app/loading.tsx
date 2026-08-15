import Image from "next/image";
import carga from "@/assets/img/carga@3x.png";

export default function Loading() {
  return (
    <main className="site-loading" aria-live="polite">
      <Image className="site-loading-art" src={carga} alt="" width={carga.width} height={carga.height} priority />
      <p className="site-loading-text">Cargando información del sitio…</p>
    </main>
  );
}