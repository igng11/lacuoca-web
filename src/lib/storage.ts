import { createClient } from "@/lib/supabase/server";

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
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

export async function validateImageFile(file: File) {
  if (!IMAGE_TYPES.has(file.type)) throw new Error("La imagen debe ser JPG, PNG o WebP.");
  if (file.size === 0) throw new Error("La imagen está vacía.");
  if (file.size > MAX_IMAGE_SIZE) throw new Error("La imagen no puede superar 5 MB.");
  const detectedType = detectImageMime(new Uint8Array(await file.arrayBuffer()));
  if (detectedType !== file.type) throw new Error("El contenido del archivo no corresponde a una imagen válida.");
}

export async function uploadImage(file: File, bucket: ImageBucket): Promise<UploadedImage> {
  await validateImageFile(file);
  const extension = EXTENSIONS[file.type];
  const path = `${crypto.randomUUID()}.${extension}`;
  const supabase = await createClient();
  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type });
  if (error) throw new Error("No pudimos subir la imagen.");
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
