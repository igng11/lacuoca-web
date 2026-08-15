import { REVIEW_FRAME, type RoughFrameShape } from "@/data/rough-frame-path";

/**
 * Marco dibujado a mano. El viewBox está recortado al bounding box del trazo y se
 * estira con preserveAspectRatio="none", así el marco calza con el borde del
 * contenedor (que debe ser position: relative).
 */
export function RoughFrame({
  shape = REVIEW_FRAME,
  color = "var(--blue)",
  className = "rough-lines",
}: {
  shape?: RoughFrameShape;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox={shape.viewBox}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d={shape.path} fill={color} />
    </svg>
  );
}
