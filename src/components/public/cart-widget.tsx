"use client";

import Image from "next/image";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, ShoppingBasket, Trash2, X } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { buildCartWhatsAppUrl } from "@/lib/whatsapp";
import type { BusinessSettings } from "@/types/database";

export function CartWidget({ settings }: { settings?: BusinessSettings | null }) {
  const { items, totalCount, totalPrice, removeItem, setQuantity, clear } = useCart();
  const [open, setOpen] = useState(false);

  if (!settings?.whatsapp_number) return null;

  const checkoutUrl = settings.business_open && items.length
    ? buildCartWhatsAppUrl({
        number: settings.whatsapp_number,
        items: items.map((item) => ({ name: item.name, price: item.price, quantity: item.quantity, flavor: item.flavor })),
        currency: settings.currency,
        showPrice: settings.show_prices,
      })
    : null;

  return (
    <>
      <button type="button" className="cart-trigger" aria-label="Ver mi pedido" onClick={() => setOpen(true)}>
        <ShoppingBasket size={30} aria-hidden="true" />
        {totalCount > 0 && <span className="cart-badge">{totalCount}</span>}
      </button>

      {open && createPortal(
        <div className="cart-drawer-overlay" onClick={() => setOpen(false)}>
          <aside className="cart-drawer" aria-label="Tu pedido" onClick={(event) => event.stopPropagation()}>
            <div className="cart-drawer-header">
              <h2>Tu pedido</h2>
              <button type="button" className="cart-drawer-close" aria-label="Cerrar" onClick={() => setOpen(false)}>
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {items.length ? (
              <>
                <ul className="cart-items">
                  {items.map((item) => (
                    <li key={`${item.productId}-${item.flavor ?? ""}`} className="cart-item">
                      <div className="cart-item-media">
                        <Image src={item.imageUrl || "/placeholder.svg"} alt="" fill sizes="64px" />
                      </div>
                      <div className="cart-item-info">
                        <span className="cart-item-name">{item.name}</span>
                        {item.flavor && <span className="cart-item-flavor">{item.flavor}</span>}
                        {settings.show_prices && <span className="cart-item-price">{formatPrice(item.price, settings.currency)}</span>}
                        <div className="cart-item-qty">
                          <button type="button" aria-label={`Restar ${item.name}`} onClick={() => setQuantity(item.productId, item.quantity - 1, item.flavor)}>
                            <Minus size={14} aria-hidden="true" />
                          </button>
                          <span>{item.quantity}</span>
                          <button type="button" aria-label={`Sumar ${item.name}`} onClick={() => setQuantity(item.productId, item.quantity + 1, item.flavor)}>
                            <Plus size={14} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <button type="button" className="cart-item-remove" aria-label={`Quitar ${item.name}`} onClick={() => removeItem(item.productId, item.flavor)}>
                        <Trash2 size={17} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="cart-drawer-footer">
                  {settings.show_prices && (
                    <div className="cart-total"><span>Total</span><strong>{formatPrice(totalPrice, settings.currency)}</strong></div>
                  )}
                  {checkoutUrl ? (
                    <a className="btn btn-primary" href={checkoutUrl} target="_blank" rel="noreferrer" onClick={() => { clear(); setOpen(false); }}>
                      Finalizar pedido por WhatsApp
                    </a>
                  ) : (
                    <p className="notice">
                      {settings.business_open ? "Todavía no configuramos un WhatsApp para recibir pedidos." : "Estamos con las consultas pausadas por el momento."}
                    </p>
                  )}
                  <button type="button" className="btn btn-soft cart-clear" onClick={clear}>Vaciar carrito</button>
                </div>
              </>
            ) : (
              <p className="cart-empty">Todavía no agregaste nada. Elegí algo rico del catálogo y lo sumás acá.</p>
            )}
          </aside>
        </div>,
        document.body,
      )}
    </>
  );
}
