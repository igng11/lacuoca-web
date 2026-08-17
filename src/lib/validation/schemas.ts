import { z } from "zod";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";

const optionalHttpUrl = z.union([z.literal(""), z.url("Ingresá una URL válida.")]).refine((value) => {
  if (!value) return true;
  const protocol = new URL(value).protocol;
  return protocol === "http:" || protocol === "https:";
}, "La URL debe comenzar con http:// o https://.");
const requiredText = z.string().trim().min(1, "Este campo es obligatorio.");
const optionalWhatsApp = z.union([
  z.literal(""),
  z.string().trim().regex(/^[+\d\s()-]{8,25}$/, "Ingresá un número de WhatsApp válido."),
]).transform(normalizeWhatsAppNumber);

export const loginSchema = z.object({
  email: z.email("Ingresá un email válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres.").max(200),
});

export const categorySchema = z.object({
  id: z.uuid().optional(), name: requiredText.max(80), description: z.string().trim().max(300),
  display_order: z.coerce.number().int().min(0), active: z.boolean(),
});

export const productSchema = z.object({
  id: z.uuid().optional(), name: requiredText.max(120), category_id: z.uuid("Elegí una categoría."),
  short_description: z.string().trim().max(180), description: z.string().trim().max(2000),
  price: z.coerce.number().min(0, "El precio no puede ser negativo."),
  display_order: z.coerce.number().int().min(0), available: z.boolean(), featured: z.boolean(), active: z.boolean(),
  flavors: z.array(z.string().trim().min(1).max(80)).max(40),
});

export const settingsSchema = z.object({
  business_name: requiredText.max(100), description: z.string().trim().max(800),
  whatsapp_number: optionalWhatsApp,
  whatsapp_default_message: requiredText.max(300), address: z.string().trim().max(200),
  opening_hours: z.string().trim().max(300), instagram_url: optionalHttpUrl,
  hero_title: requiredText.max(120), hero_subtitle: z.string().trim().max(200),
  show_prices: z.boolean(), business_open: z.boolean(),
});
