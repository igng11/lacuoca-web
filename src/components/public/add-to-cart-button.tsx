"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ShoppingBasket } from "lucide-react";
import { addItem } from "@/lib/cart-store";
import type { Product } from "@/types/database";

/**
 * Sin sabores: botón normal. Con sabores: el propio "Agregar" abre un menú
 * propio (no un <select> nativo) con la misma clase .btn — mismo pill, mismo
 * alto, mismo lugar. Un <select> nativo no se puede restylear de verdad: el
 * navegador dibuja el popup de opciones con su propia fuente/fondo, fuera del
 * alcance del CSS. Con un menú propio el look queda 100% controlado.
 */
export function AddToCartButton({ product, className = "btn btn-primary" }: { product: Product; className?: string }) {
  const [justAdded, setJustAdded] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const hasFlavors = product.flavors.length > 0;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (hasFlavors) {
    return (
      <div className="add-to-cart-dropdown" ref={rootRef}>
        <button
          type="button"
          className={`${className} add-to-cart-trigger`}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {justAdded
            ? <><Check size={17} aria-hidden="true" /> ¡Agregado!</>
            : <><ShoppingBasket size={17} aria-hidden="true" /> Agregar</>}
          <ChevronDown size={15} aria-hidden="true" className="add-to-cart-chevron" />
        </button>
        {open && (
          <ul className="add-to-cart-menu" role="listbox" aria-label={`Sabores de ${product.name}`}>
            {product.flavors.map((flavor) => (
              <li key={flavor} role="option" aria-selected={false}>
                <button
                  type="button"
                  className="add-to-cart-option"
                  onClick={() => {
                    addItem(product, 1, flavor);
                    setOpen(false);
                    setJustAdded(true);
                    window.setTimeout(() => setJustAdded(false), 1400);
                  }}
                >
                  {flavor}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        addItem(product, 1, null);
        setJustAdded(true);
        window.setTimeout(() => setJustAdded(false), 1400);
      }}
    >
      {justAdded
        ? <><Check size={17} aria-hidden="true" /> Agregado</>
        : <><ShoppingBasket size={17} aria-hidden="true" /> Agregar</>}
    </button>
  );
}
