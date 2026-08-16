import { createClient } from "@/lib/supabase/server";
import { imageSelectionError } from "@/lib/image-validation";

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export type ImageBucket = "products" | "branding";
export type UploadedImage = { bucket: ImageBucket; path: string; publicUrl: string };

export function detectImageMime(bytes: Uint8Array) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (
    bytes.length >= 8
    && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
    && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) return "image/png";
  if (
    bytes.length >= 12
    && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
    && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) return "image/webp";
  return null;
}

// SVG es texto, no tiene firma binaria: alcanza con buscar la etiqueta <svg>
// cerca del principio (Illustrator suele anteponer el prólogo XML, un DOCTYPE
// y un comentario "Generator:" antes de la etiqueta real).
function looksLikeSvg(bytes: Uint8Array) {
  const head = new TextDecoder("utf-8", { fatal: false }).decode(bytes.slice(0, 1000));
  return /<svg[\s>]/i.test(head);
}

// Los SVG de Illustrator no traen scripts, pero el archivo sirve para el logo
// público del sitio: cualquier <script>, atributo on* o href="javascript:"
// que llegue a colarse se ejecutaría en el navegador de cada visitante. Esto
// es una limpieza básica por regex, no un sanitizador XML completo — alcanza
// para el caso real (un export de Illustrator), no para contenido adversarial.
function sanitizeSvg(svg: string): string {
  return svg
    .replace(/<script[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<foreignObject[\s\S]*?<\/foreignObject\s*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/((?:xlink:)?href)\s*=\s*("|')\s*javascript:[^"']*\2/gi, "$1=$2#$2");
}

export async function validateImageFile(file: File, allowSvg = false) {
  const selectionError = imageSelectionError(file, allowSvg);
  if (selectionError) throw new Error(selectionError);
  if (allowSvg && file.type === "image/svg+xml") {
    if (!looksLikeSvg(new Uint8Array(await file.arrayBuffer()))) {
      throw new Error("El archivo seleccionado no es un SVG válido.");
    }
    return;
  }
  const detectedType = detectImageMime(new Uint8Array(await file.arrayBuffer()));
  if (detectedType !== file.type) throw new Error("El archivo seleccionado no es una imagen válida.");
}

export async function uploadImage(file: File, bucket: ImageBucket, options: { allowSvg?: boolean } = {}): Promise<UploadedImage> {
  await validateImageFile(file, options.allowSvg);
  const extension = EXTENSIONS[file.type];
  const path = `${crypto.randomUUID()}.${extension}`;
  const supabase = await createClient();
  const body = file.type === "image/svg+xml" ? new Blob([sanitizeSvg(await file.text())], { type: file.type }) : file;
  const { error } = await supabase.storage.from(bucket).upload(path, body, { contentType: file.type });
  if (error) throw new Error("No pudimos subir la imagen. Revisá tu conexión e intentá nuevamente.");
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { bucket, path, publicUrl: data.publicUrl };
}

export function storagePathFromPublicUrl(url: string | null | undefined, bucket: ImageBucket) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (configuredUrl && !configuredUrl.includes("YOUR_PROJECT")) {
      if (parsed.origin !== new URL(configuredUrl).origin) return null;
    }
    const pathname = parsed.pathname;
    const prefix = `/storage/v1/object/public/${bucket}/`;
    if (!pathname.startsWith(prefix)) return null;
    const path = decodeURIComponent(pathname.slice(prefix.length));
    return path && !path.includes("\\") && !path.split("/").includes("..") ? path : null;
  } catch {
    return null;
  }
}

export async function removeUploadedImage(image: UploadedImage) {
  const supabase = await createClient();
  const { error } = await supabase.storage.from(image.bucket).remove([image.path]);
  if (error) throw new Error("No pudimos eliminar la imagen subida.");
}

export async function removeImageByUrl(bucket: ImageBucket, url: string | null | undefined) {
  const path = storagePathFromPublicUrl(url, bucket);
  if (!path) return;
  const supabase = await createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error("No pudimos eliminar la imagen anterior.");
}
