"use client";

import Image from "next/image";
import { useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Minus, Plus, ShoppingBasket, Trash2, X } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { buildCartWhatsAppUrl } from "@/lib/whatsapp";
import type { BusinessSettings } from "@/types/database";

type Stage = "cart" | "address" | "confirm";
const DELIVERY_DAYS = ["Miércoles", "Sábado"];

export function CartWidget({ settings }: { settings?: BusinessSettings | null }) {
  const { items, totalCount, totalPrice, removeItem, setQuantity, clear } = useCart();
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("cart");
  const [address, setAddress] = useState("");
  const [addressError, setAddressError] = useState(false);
  const [deliveryDay, setDeliveryDay] = useState("");
  const [deliveryDayError, setDeliveryDayError] = useState(false);

  if (!settings?.whatsapp_number) return null;

  const canCheckout = settings.business_open && items.length > 0;

  const close = () => {
    setOpen(false);
    setStage("cart");
    setAddressError(false);
    setDeliveryDayError(false);
  };

  const checkoutUrl = canCheckout
    ? buildCartWhatsAppUrl({
        number: settings.whatsapp_number,
        items: items.map((item) => ({ name: item.name, price: item.price, quantity: item.quantity, flavor: item.flavor })),
        currency: settings.currency,
        showPrice: settings.show_prices,
        address,
        deliveryDay,
      })
    : null;

  return (
    <>
      <button type="button" className="cart-trigger" aria-label="Ver mi pedido" onClick={() => setOpen(true)}>
        <ShoppingBasket size={30} aria-hidden="true" />
        {totalCount > 0 && <span className="cart-badge">{totalCount}</span>}
      </button>

      {open && createPortal(
        <div className="cart-drawer-overlay" onClick={close}>
          <aside className="cart-drawer" aria-label="Tu pedido" onClick={(event) => event.stopPropagation()}>
            <div className="cart-drawer-header">
              {stage !== "cart" && (
                <button
                  type="button"
                  className="cart-drawer-back"
                  aria-label="Volver"
                  onClick={() => setStage(stage === "confirm" ? "address" : "cart")}
                >
                  <ArrowLeft size={20} aria-hidden="true" />
                </button>
              )}
              <h2>
                {stage === "cart" && "Tu pedido"}
                {stage === "address" && "¿A dónde lo llevamos?"}
                {stage === "confirm" && "Confirmá tu pedido"}
              </h2>
              <button type="button" className="cart-drawer-close" aria-label="Cerrar" onClick={close}>
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {items.length === 0 && (
              <p className="cart-empty">Todavía no agregaste nada. Elegí algo rico del catálogo y lo sumás acá.</p>
            )}

            {items.length > 0 && stage === "cart" && (
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
                  {canCheckout ? (
                    <button type="button" className="btn btn-primary" onClick={() => setStage("address")}>
                      Continuar
                    </button>
                  ) : (
                    <p className="notice">
                      {settings.business_open ? "Todavía no configuramos un WhatsApp para recibir pedidos." : "Estamos con las consultas pausadas por el momento."}
                    </p>
                  )}
                  <button type="button" className="btn btn-soft cart-clear" onClick={clear}>Vaciar carrito</button>
                </div>
              </>
            )}

            {items.length > 0 && stage === "address" && (
              <div className="cart-checkout-step">
                <div className="field">
                  <label htmlFor="cart-address">Dirección de entrega</label>
                  <textarea
                    id="cart-address"
                    className="input"
                    rows={3}
                    placeholder="Calle, altura, piso/depto, entre calles, referencias..."
                    value={address}
                    onChange={(event) => { setAddress(event.target.value); setAddressError(false); }}
                  />
                  {addressError && <small className="cart-checkout-error">Contanos la dirección para poder coordinar la entrega.</small>}
                </div>
                <div className="field">
                  <label>Día de entrega</label>
                  <div className="cart-delivery-days">
                    {DELIVERY_DAYS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        className={`cart-delivery-day${deliveryDay === day ? " is-selected" : ""}`}
                        onClick={() => { setDeliveryDay(day); setDeliveryDayError(false); }}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  {deliveryDayError && <small className="cart-checkout-error">Elegí miércoles o sábado para coordinar la entrega.</small>}
                </div>
                <div className="cart-drawer-footer">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      let ok = true;
                      if (!address.trim()) { setAddressError(true); ok = false; }
                      if (!deliveryDay) { setDeliveryDayError(true); ok = false; }
                      if (!ok) return;
                      setStage("confirm");
                    }}
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {items.length > 0 && stage === "confirm" && (
              <div className="cart-checkout-step">
                <ul className="cart-confirm-summary">
                  {items.map((item) => (
                    <li key={`${item.productId}-${item.flavor ?? ""}`}>
                      <span>{item.quantity}x {item.name}{item.flavor ? ` (${item.flavor})` : ""}</span>
                      {settings.show_prices && <span>{formatPrice(item.price * item.quantity, settings.currency)}</span>}
                    </li>
                  ))}
                </ul>
                {settings.show_prices && (
                  <div className="cart-total"><span>Total</span><strong>{formatPrice(totalPrice, settings.currency)}</strong></div>
                )}
                <div className="cart-confirm-address">
                  <strong>Dirección de entrega</strong>
                  <p>{address}</p>
                </div>
                <div className="cart-confirm-address">
                  <strong>Día de entrega</strong>
                  <p>{deliveryDay}</p>
                </div>
                <div className="cart-drawer-footer">
                  {checkoutUrl && (
                    <a className="btn btn-primary" href={checkoutUrl} target="_blank" rel="noreferrer" onClick={() => { clear(); close(); }}>
                      Confirmar y enviar por WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>,
        document.body,
      )}
    </>
  );
}
