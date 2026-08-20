import { formatPrice } from "@/lib/format";

export function normalizeWhatsAppNumber(value: string) {
  return value.trim().replace(/\D/g, "").replace(/^00/, "");
}

export function buildWhatsAppUrl(number: string, message: string) {
  const normalized = normalizeWhatsAppNumber(number);
  return normalized ? `https://wa.me/${normalized}?text=${encodeURIComponent(message.trim())}` : null;
}

export function buildCartWhatsAppUrl(input: {
  number: string;
  items: { name: string; price: number; quantity: number; flavor?: string | null }[];
  currency: string;
  showPrice: boolean;
  address?: string;
  deliveryDay?: string;
}) {
  const lines = input.items.map((item) => {
    const price = input.showPrice ? ` – ${formatPrice(item.price, input.currency)} c/u` : "";
    const flavor = item.flavor ? ` (${item.flavor})` : "";
    return `- ${item.quantity}x ${item.name}${flavor}${price}`;
  });
  const total = input.showPrice
    ? `\n\nTotal: ${formatPrice(input.items.reduce((sum, item) => sum + item.price * item.quantity, 0), input.currency)}`
    : "";
  const address = input.address?.trim() ? `\n\nDirección de entrega: ${input.address.trim()}` : "";
  const deliveryDay = input.deliveryDay?.trim() ? `\nDía de entrega: ${input.deliveryDay.trim()}` : "";
  return buildWhatsAppUrl(input.number, `Hola! Quiero hacer este pedido:\n${lines.join("\n")}${total}${address}${deliveryDay}`);
}
