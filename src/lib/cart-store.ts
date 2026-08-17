"use client";

import { useMemo, useSyncExternalStore } from "react";
import { loadCart, saveCart, type CartItem } from "@/lib/cart";
import type { Product } from "@/types/database";

/**
 * Store externo a React (mismo patrón que Zustand/Redux): un solo módulo
 * compartido por todos los componentes cliente, sin <Provider> — cada pestaña
 * del navegador tiene su propia instancia del módulo. Se sincroniza con
 * useSyncExternalStore en vez de useState+useEffect para no pisar el
 * lint de "setState sincrónico dentro de un efecto".
 */
let items: CartItem[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  saveCart(items);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!hydrated) {
    hydrated = true;
    items = loadCart();
    listeners.forEach((current) => current());
  }
  return () => listeners.delete(listener);
}

const getSnapshot = () => items;
const getServerSnapshot = () => items;

// Dos líneas del mismo producto con sabores distintos son items separados:
// la identidad del carrito es productId + flavor, no solo productId.
const sameLine = (item: CartItem, productId: string, flavor: string | null) =>
  item.productId === productId && item.flavor === flavor;

export function addItem(product: Product, quantity = 1, flavor: string | null = null) {
  const existing = items.find((item) => sameLine(item, product.id, flavor));
  items = existing
    ? items.map((item) => sameLine(item, product.id, flavor) ? { ...item, quantity: item.quantity + quantity } : item)
    : [...items, { productId: product.id, slug: product.slug, name: product.name, price: product.price, imageUrl: product.image_url, flavor, quantity }];
  emit();
}

export function removeItem(productId: string, flavor: string | null = null) {
  items = items.filter((item) => !sameLine(item, productId, flavor));
  emit();
}

export function setQuantity(productId: string, quantity: number, flavor: string | null = null) {
  if (quantity < 1) { removeItem(productId, flavor); return; }
  items = items.map((item) => sameLine(item, productId, flavor) ? { ...item, quantity } : item);
  emit();
}

export function clear() {
  items = [];
  emit();
}

export function useCart() {
  const cartItems = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { totalCount, totalPrice } = useMemo(() => ({
    totalCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0),
  }), [cartItems]);

  return { items: cartItems, totalCount, totalPrice, addItem, removeItem, setQuantity, clear };
}
