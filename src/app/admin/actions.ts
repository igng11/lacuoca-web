"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { categorySchema, productSchema, settingsSchema } from "@/lib/validation/schemas";
import { firstError, formBoolean, formString } from "@/lib/forms";
import { slugify } from "@/lib/format";
import {
  removeImageByUrl,
  removeUploadedImage,
  uploadImage,
  type UploadedImage,
} from "@/lib/storage";

function adminRedirect(path: string, message: string, type: "ok" | "error" = "ok"): never {
  redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

function requiredId(data: FormData, path: string) {
  const parsed = z.uuid().safeParse(formString(data, "id"));
  if (!parsed.success) adminRedirect(path, "El identificador recibido no es válido.", "error");
  return parsed.data;
}

async function discardUpload(image: UploadedImage | undefined) {
  if (!image) return;
  try {
    await removeUploadedImage(image);
  } catch {
    // The database remains consistent; an orphan may require manual cleanup.
  }
}

async function discardPreviousImage(bucket: "products" | "branding", url: string | null) {
  try {
    await removeImageByUrl(bucket, url);
  } catch {
    // Saving succeeded. Do not report a failed save only because old-object cleanup failed.
  }
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function saveCategory(data: FormData) {
  const supabase = await requireAdmin();
  const parsed = categorySchema.safeParse({
    id: formString(data, "id") || undefined,
    name: formString(data, "name"),
    description: formString(data, "description"),
    display_order: formString(data, "display_order"),
    active: formBoolean(data, "active"),
  });
  if (!parsed.success) adminRedirect("/admin/categorias", firstError(parsed.error), "error");

  const slug = slugify(parsed.data.name);
  if (!slug) adminRedirect("/admin/categorias", "El nombre debe contener letras o números.", "error");

  const { id, ...values } = parsed.data;
  const payload = { ...values, slug };
  const result = id
    ? await supabase.from("categories").update(payload).eq("id", id)
    : await supabase.from("categories").insert(payload);

  if (result.error) {
    const message = result.error.code === "23505"
      ? "Ya existe una categoría con ese nombre."
      : "No pudimos guardar la categoría. Intentá nuevamente.";
    adminRedirect("/admin/categorias", message, "error");
  }

  revalidatePath("/", "layout");
  adminRedirect("/admin/categorias", id ? "Categoría actualizada correctamente." : "Categoría creada correctamente.");
}

export async function deleteCategory(data: FormData) {
  const supabase = await requireAdmin();
  const id = requiredId(data, "/admin/categorias");
  const { count, error: countError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (countError) adminRedirect("/admin/categorias", "No pudimos verificar los productos asociados.", "error");
  if (count) {
    adminRedirect(
      "/admin/categorias",
      `No se puede eliminar: tiene ${count} producto(s). Reasignalos primero.`,
      "error",
    );
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) adminRedirect("/admin/categorias", "No pudimos eliminar la categoría. Intentá nuevamente.", "error");
  revalidatePath("/", "layout");
  adminRedirect("/admin/categorias", "Categoría eliminada correctamente.");
}

export async function saveProduct(data: FormData) {
  const supabase = await requireAdmin();
  const parsed = productSchema.safeParse({
    id: formString(data, "id") || undefined,
    name: formString(data, "name"),
    category_id: formString(data, "category_id"),
    short_description: formString(data, "short_description"),
    description: formString(data, "description"),
    price: formString(data, "price"),
    display_order: formString(data, "display_order"),
    available: formBoolean(data, "available"),
    featured: formBoolean(data, "featured"),
    active: formBoolean(data, "active"),
  });
  if (!parsed.success) adminRedirect("/admin/productos", firstError(parsed.error), "error");

  const slug = slugify(parsed.data.name);
  if (!slug) adminRedirect("/admin/productos", "El nombre debe contener letras o números.", "error");

  const { id, ...values } = parsed.data;
  let previousImage: string | null = null;

  if (id) {
    const { data: existing, error } = await supabase
      .from("products")
      .select("image_url")
      .eq("id", id)
      .maybeSingle();
    if (error || !existing) adminRedirect("/admin/productos", "El producto ya no existe.", "error");
    previousImage = existing.image_url as string | null;
  }

  const file = data.get("image");
  let uploaded: UploadedImage | undefined;
  try {
    if (file instanceof File && file.size > 0) uploaded = await uploadImage(file, "products");
  } catch (error) {
    adminRedirect(
      "/admin/productos",
      error instanceof Error ? error.message : "No pudimos subir la imagen. Revisá tu conexión e intentá nuevamente.",
      "error",
    );
  }

  const payload = {
    ...values,
    slug,
    image_url: uploaded?.publicUrl ?? previousImage,
  };
  const result = id
    ? await supabase.from("products").update(payload).eq("id", id)
    : await supabase.from("products").insert(payload);

  if (result.error) {
    await discardUpload(uploaded);
    let message = "No pudimos guardar el producto. Intentá nuevamente.";
    if (result.error.code === "23505") message = "Ya existe un producto con ese nombre.";
    if (result.error.code === "23503") message = "La categoría seleccionada ya no existe. Actualizá la página y volvé a elegirla.";
    adminRedirect("/admin/productos", message, "error");
  }

  if (uploaded && previousImage) await discardPreviousImage("products", previousImage);
  revalidatePath("/", "layout");
  adminRedirect("/admin/productos", id ? "Producto actualizado correctamente." : "Producto guardado correctamente.");
}

export async function deleteProduct(data: FormData) {
  const supabase = await requireAdmin();
  const id = requiredId(data, "/admin/productos");
  const { data: product, error: readError } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();
  if (readError || !product) adminRedirect("/admin/productos", "El producto ya no existe.", "error");

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) adminRedirect("/admin/productos", "No pudimos eliminar el producto. Intentá nuevamente.", "error");
  await discardPreviousImage("products", product.image_url as string | null);
  revalidatePath("/", "layout");
  adminRedirect("/admin/productos", "Producto eliminado correctamente.");
}

export async function saveSettings(data: FormData) {
  const supabase = await requireAdmin();
  const parsed = settingsSchema.safeParse({
    business_name: formString(data, "business_name"),
    description: formString(data, "description"),
    whatsapp_number: formString(data, "whatsapp_number"),
    whatsapp_default_message: formString(data, "whatsapp_default_message"),
    address: formString(data, "address"),
    opening_hours: formString(data, "opening_hours"),
    instagram_url: formString(data, "instagram_url"),
    primary_color: formString(data, "primary_color"),
    secondary_color: formString(data, "secondary_color"),
    hero_title: formString(data, "hero_title"),
    hero_subtitle: formString(data, "hero_subtitle"),
    currency: formString(data, "currency").toUpperCase(),
    show_prices: formBoolean(data, "show_prices"),
    business_open: formBoolean(data, "business_open"),
  });
  if (!parsed.success) adminRedirect("/admin/configuracion", firstError(parsed.error), "error");

  const { data: current, error: currentError } = await supabase
    .from("business_settings")
    .select("id,logo_url,hero_image_url")
    .limit(1)
    .maybeSingle();
  if (currentError) adminRedirect("/admin/configuracion", "No pudimos leer la configuración actual.", "error");

  let logoUpload: UploadedImage | undefined;
  let heroUpload: UploadedImage | undefined;
  try {
    const logoFile = data.get("logo");
    const heroFile = data.get("hero_image");
    if (logoFile instanceof File && logoFile.size > 0) logoUpload = await uploadImage(logoFile, "branding");
    if (heroFile instanceof File && heroFile.size > 0) heroUpload = await uploadImage(heroFile, "branding");
  } catch (error) {
    await discardUpload(logoUpload);
    await discardUpload(heroUpload);
    adminRedirect(
      "/admin/configuracion",
      error instanceof Error ? error.message : "No pudimos subir la imagen. Revisá tu conexión e intentá nuevamente.",
      "error",
    );
  }

  const payload = {
    ...parsed.data,
    whatsapp_number: parsed.data.whatsapp_number || null,
    instagram_url: parsed.data.instagram_url || null,
    logo_url: logoUpload?.publicUrl ?? (current?.logo_url as string | null | undefined) ?? null,
    hero_image_url: heroUpload?.publicUrl ?? (current?.hero_image_url as string | null | undefined) ?? null,
  };
  const result = current
    ? await supabase.from("business_settings").update(payload).eq("id", current.id)
    : await supabase.from("business_settings").insert(payload);

  if (result.error) {
    await discardUpload(logoUpload);
    await discardUpload(heroUpload);
    adminRedirect("/admin/configuracion", "No pudimos guardar la configuración. Intentá nuevamente.", "error");
  }

  if (logoUpload && current?.logo_url) {
    await discardPreviousImage("branding", current.logo_url as string);
  }
  if (heroUpload && current?.hero_image_url) {
    await discardPreviousImage("branding", current.hero_image_url as string);
  }
  revalidatePath("/", "layout");
  adminRedirect("/admin/configuracion", "Información del negocio actualizada.");
}
