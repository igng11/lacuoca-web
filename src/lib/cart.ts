export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
  flavor: string | null;
  quantity: number;
};

export const BULK_VIANDA_THRESHOLD = 5;
export const BULK_VIANDA_UNIT_PRICE = 12000;

export function calculateCartPricing(items: CartItem[]) {
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const hasBulkPrice = totalCount > BULK_VIANDA_THRESHOLD;
  const totalPrice = items.reduce(
    (sum, item) => sum + item.quantity * (hasBulkPrice ? BULK_VIANDA_UNIT_PRICE : item.price),
    0,
  );

  return { totalCount, totalPrice, hasBulkPrice };
}

const STORAGE_KEY = "lacuoca-cart";

export function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    // Carritos guardados antes de que existiera "flavor" no tienen esa clave.
    return parsed.map((item) => ({ flavor: null, ...item }));
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage puede fallar (modo privado, cuota llena) — el carrito sigue
    // andando en memoria para lo que dure la sesión, solo no persiste.
  }
}
