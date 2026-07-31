export const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
export const MAX_IMAGE_SIZE_LABEL = "4 MB";
export const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function imageSelectionError(file: Pick<File, "size" | "type">) {
  if (file.size === 0) return "El archivo seleccionado no es una imagen válida.";
  if (!IMAGE_TYPES.has(file.type)) return "Solo se permiten imágenes JPG, PNG o WebP.";
  if (file.size > MAX_IMAGE_SIZE) {
    return "La imagen supera el máximo permitido de 4 MB. Elegí una imagen más liviana.";
  }
  return null;
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
