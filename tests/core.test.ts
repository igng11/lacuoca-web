import { describe, expect, it } from "vitest";
import { contrastRatio, readableAccent, textColorOn } from "@/lib/color";
import { slugify } from "@/lib/format";
import { buildCartWhatsAppUrl, buildWhatsAppUrl, normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { productSchema, settingsSchema } from "@/lib/validation/schemas";
import { detectImageMime, storagePathFromPublicUrl } from "@/lib/storage";
import { imageSelectionError, MAX_IMAGE_SIZE } from "@/lib/image-validation";

const validSettings = {
  business_name: "La Cuoca",
  description: "",
  whatsapp_number: "+54 9 11-2345-6789",
  whatsapp_default_message: "Hola",
  address: "",
  opening_hours: "",
  instagram_url: "https://instagram.com/lacuoca",
  hero_title: "Sabores",
  hero_subtitle: "",
  show_prices: true,
  business_open: true,
};

const validProduct = {
  name: "Torta",
  category_id: "10000000-0000-4000-8000-000000000001",
  short_description: "",
  description: "",
  price: 0,
  display_order: 0,
  available: true,
  featured: false,
  active: true,
  flavors: [],
};

describe("WhatsApp", () => {
  it.each([
    ["+54 9 11 2345-6789", "5491123456789"],
    ["0054-9-11-2345-6789", "5491123456789"],
    ["", ""],
  ])("normaliza %s", (input, expected) => {
    expect(normalizeWhatsAppNumber(input)).toBe(expected);
  });

  it("devuelve null sin número y codifica caracteres especiales", () => {
    expect(buildWhatsAppUrl("", "Hola")).toBeNull();
    const url = buildWhatsAppUrl("+54 9 11-2345-6789", "Torta & café + té");
    expect(url).not.toBeNull();
    expect(new URL(url!).searchParams.get("text")).toBe("Torta & café + té");
  });

  it("incluye u oculta el precio según la configuración", () => {
    const items = [{ name: "Torta & café", price: 12500, quantity: 2 }];
    const withPrice = buildCartWhatsAppUrl({ number: "+54 9 11-2345-6789", items, currency: "ARS", showPrice: true });
    const withoutPrice = buildCartWhatsAppUrl({ number: "+54 9 11-2345-6789", items, currency: "ARS", showPrice: false });
    expect(new URL(withPrice!).searchParams.get("text")).toContain("$");
    expect(new URL(withoutPrice!).searchParams.get("text")).not.toContain("$");
  });

  it("arma un pedido con varios items y el total correcto", () => {
    const url = buildCartWhatsAppUrl({
      number: "+54 9 11-2345-6789",
      items: [
        { name: "Tarta de verdura", price: 4000, quantity: 2 },
        { name: "Milanesa napolitana", price: 6500, quantity: 1 },
      ],
      currency: "ARS",
      showPrice: true,
    });
    const text = new URL(url!).searchParams.get("text")!;
    expect(text).toContain("2x Tarta de verdura");
    expect(text).toContain("1x Milanesa napolitana");
    expect(text).toContain("Total: " + new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 }).format(14500));
  });
});

describe("slugs y validaciones", () => {
  it("genera slugs estables con acentos y símbolos", () => {
    expect(slugify("  Cheesecake de Limón & Café  ")).toBe("cheesecake-de-limon-cafe");
    expect(slugify("!!!")).toBe("");
  });

  it("acepta precio cero y rechaza precio negativo o nombre vacío", () => {
    expect(productSchema.safeParse(validProduct).success).toBe(true);
    expect(productSchema.safeParse({ ...validProduct, price: -1 }).success).toBe(false);
    expect(productSchema.safeParse({ ...validProduct, name: "   " }).success).toBe(false);
  });

  it("normaliza WhatsApp y bloquea URLs peligrosas", () => {
    const parsed = settingsSchema.parse(validSettings);
    expect(parsed.whatsapp_number).toBe("5491123456789");
    expect(settingsSchema.safeParse({ ...validSettings, whatsapp_number: "" }).success).toBe(true);
    expect(settingsSchema.safeParse({ ...validSettings, instagram_url: "javascript:alert(1)" }).success).toBe(false);
  });
});

describe("imágenes", () => {
  it("acepta tipos permitidos hasta 4 MB y explica tamaño o formato inválidos", () => {
    expect(imageSelectionError({ size: MAX_IMAGE_SIZE, type: "image/jpeg" })).toBeNull();
    expect(imageSelectionError({ size: MAX_IMAGE_SIZE + 1, type: "image/jpeg" })).toContain("4 MB");
    expect(imageSelectionError({ size: 100, type: "application/pdf" })).toBe("Solo se permiten imágenes JPG, PNG o WebP.");
    expect(imageSelectionError({ size: 0, type: "image/png" })).toBe("El archivo seleccionado no es una imagen válida.");
  });

  it("detecta firmas JPG, PNG y WebP y rechaza contenido arbitrario", () => {
    expect(detectImageMime(new Uint8Array([0xff, 0xd8, 0xff, 0x00]))).toBe("image/jpeg");
    expect(detectImageMime(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe("image/png");
    expect(detectImageMime(new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]))).toBe("image/webp");
    expect(detectImageMime(new TextEncoder().encode("<script>alert(1)</script>"))).toBeNull();
  });

  it("sólo extrae rutas del bucket esperado", () => {
    const url = "https://demo.supabase.co/storage/v1/object/public/products/photo.jpg";
    expect(storagePathFromPublicUrl(url, "products")).toBe("photo.jpg");
    expect(storagePathFromPublicUrl(url, "branding")).toBeNull();
    expect(storagePathFromPublicUrl("https://example.com/photo.jpg", "products")).toBeNull();
  });
});

describe("contraste de marca", () => {
  it("elige texto y acentos con contraste AA", () => {
    expect(contrastRatio("#ffffff", "#000000")).toBeGreaterThan(20);
    expect(textColorOn("#fef08a")).toBe("#000000");
    expect(textColorOn("#14532d")).toBe("#ffffff");
    expect(contrastRatio(readableAccent("#fef08a"), "#fffaf2")).toBeGreaterThanOrEqual(4.5);
  });
});
