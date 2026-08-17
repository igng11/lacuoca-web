export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
  flavor: string | null;
  quantity: number;
};

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
