import { HERO_ARCH } from "@/data/hero-arch";

/**
 * Foto del hero recortada con el arco dibujado a mano, más el marco y los rayos.
 *
 * Va todo en un SVG inline en vez de un clip-path de CSS: adentro del SVG el
 * clipPath usa las coordenadas originales del archivo de Illustrator, así que no
 * hay que normalizar el path ni sincronizar proporciones a mano.
 *
 * La <image> con preserveAspectRatio="xMidYMid slice" se comporta como un
 * object-fit: cover — la foto llena el arco y se recorta lo que sobra.
 */
export function HeroArch({ src, alt }: { src: string; alt: string }) {
  return (
    <svg className="hero-arch" viewBox={HERO_ARCH.viewBox} role="img" aria-label={alt}>
      <defs>
        <clipPath id="hero-arch-clip">
          <path d={HERO_ARCH.contorno} />
        </clipPath>
      </defs>
      <image
        href={src}
        x={0}
        y={0}
        width={HERO_ARCH.width}
        height={HERO_ARCH.height}
        preserveAspectRatio="xMidYMid slice"
        clipPath="url(#hero-arch-clip)"
      />
      <path d={HERO_ARCH.marco} fill="var(--red)" />
      <path d={HERO_ARCH.rayos} fill="var(--red)" />
    </svg>
  );
}
