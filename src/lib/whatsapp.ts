import { formatPrice } from "@/lib/format";

export function normalizeWhatsAppNumber(value: string) {
  return value.trim().replace(/\D/g, "").replace(/^00/, "");
}

export function buildWhatsAppUrl(number: string, message: string) {
  const normalized = normalizeWhatsAppNumber(number);
  return normalized ? `https://wa.me/${normalized}?text=${encodeURIComponent(message.trim())}` : null;
}

export function buildProductWhatsAppUrl(input: {
  number: string; productName: string; price: number; currency: string; showPrice: boolean;
}) {
  const price = input.showPrice ? `, publicado a ${formatPrice(input.price, input.currency)}` : "";
  return buildWhatsAppUrl(input.number, `Hola, quiero consultar por ${input.productName}${price}.`);
}
