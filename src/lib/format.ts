export function formatPrice(value: number, currency = "ARS") {
  const safeCurrency = /^[A-Z]{3}$/.test(currency) ? currency : "ARS";
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: safeCurrency, maximumFractionDigits: 2 }).format(value);
}

export function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
