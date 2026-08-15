import Link from "next/link";
import { Package, Tags, CheckCircle } from "lucide-react";
import { Feedback } from "@/components/admin/feedback";
import { Greeting } from "@/components/admin/greeting";
import { ImageInput } from "@/components/admin/image-input";
import { FormSubmitButton, PendingFormFields } from "@/components/admin/form-submit-button";
import { RoughFrame } from "@/components/rough-frame";
import { ABOUT_FRAME, SETTINGS_FRAME } from "@/data/rough-frame-path";
import { saveSettings } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/supabase/admin";
import { getSettings } from "@/services/catalog";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const s = await requireAdmin();
  const [results, settings, message] = await Promise.all([
    Promise.all([
      s.from("products").select("id", { count: "exact", head: true }),
      s.from("categories").select("id", { count: "exact", head: true }),
      s.from("products").select("id", { count: "exact", head: true }).eq("available", true),
      s.from("products").select("id", { count: "exact", head: true }).eq("featured", true),
    ]),
    getSettings(),
    searchParams,
  ]);
  if (results.some((result) => result.error)) throw new Error("No se pudo cargar el resumen administrativo.");
  const [{ count: products }, { count: categories }, { count: available }, { count: featured }] = results;
  const links = [
    ["/admin/productos", "Productos", "Crear, editar y ordenar", Package],
    ["/admin/categorias", "Categorías", "Organizar el catálogo", Tags],
  ] as const;

  return (
    <div className="stack">
      <div>
        <Greeting />
        <div className="title-row">
          <h1>¿Qué querés hacer?</h1>
          <p className="muted">Todo lo importante está a un toque.</p>
        </div>
      </div>

      <Feedback {...message} />

      <div className="grid-cards quick-cards">
        {links.map(([href, title, text, Icon]) => (
          <Link className="card" style={{ padding: "1.5rem" }} href={href} key={href}>
            <RoughFrame shape={ABOUT_FRAME} />
            <Icon size={26} color="var(--primary)" />
            <h2 style={{ marginTop: ".5rem" }}>{title}</h2>
            <p className="muted">{text}</p>
          </Link>
        ))}
      </div>

      <details id="configuracion" className="card create-panel settings-panel">
        <summary>
          <RoughFrame shape={SETTINGS_FRAME} />
          <strong>Información del negocio</strong>
          {/* Corto a propósito: si envuelve en mobile, el alto del summary cambia
              y el marco (proporción fija) se deforma. */}
          <div className="muted">Datos, imágenes y colores</div>
        </summary>
        <form action={saveSettings} className="stack">
          <PendingFormFields>
            <h2>Datos principales</h2>
            <div className="field">
              <label htmlFor="business-name">Nombre del negocio *</label>
              <input id="business-name" className="input" name="business_name" required defaultValue={settings.business_name} />
            </div>
            <div className="field">
              <label htmlFor="business-description">Descripción</label>
              <textarea id="business-description" className="input" name="description" rows={4} defaultValue={settings.description || ""} />
            </div>
            <div className="form-grid two">
              <div className="field">
                <label htmlFor="whatsapp-number">WhatsApp</label>
                <input id="whatsapp-number" className="input" name="whatsapp_number" inputMode="tel" autoComplete="tel" placeholder="+54 9…" defaultValue={settings.whatsapp_number || ""} />
              </div>
              <div className="field">
                <label htmlFor="instagram-url">Instagram (URL completa)</label>
                <input id="instagram-url" className="input" name="instagram_url" type="url" inputMode="url" autoComplete="url" defaultValue={settings.instagram_url || ""} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="whatsapp-message">Mensaje general de WhatsApp *</label>
              <input id="whatsapp-message" className="input" name="whatsapp_default_message" required defaultValue={settings.whatsapp_default_message} />
            </div>
            <div className="field">
              <label htmlFor="business-address">Dirección</label>
              <input id="business-address" className="input" name="address" autoComplete="street-address" defaultValue={settings.address || ""} />
            </div>
            <div className="field">
              <label htmlFor="opening-hours">Horarios</label>
              <textarea id="opening-hours" className="input" name="opening_hours" rows={3} defaultValue={settings.opening_hours || ""} />
            </div>

            <h2>Portada e imágenes</h2>
            <div className="field">
              <label htmlFor="hero-title">Título principal *</label>
              <input id="hero-title" className="input" name="hero_title" required defaultValue={settings.hero_title} />
            </div>
            <div className="field">
              <label htmlFor="hero-subtitle">Texto secundario</label>
              <input id="hero-subtitle" className="input" name="hero_subtitle" defaultValue={settings.hero_subtitle || ""} />
            </div>
            <div className="form-grid two">
              <ImageInput name="logo" label="Logo (se muestra en el menú de arriba)" current={settings.logo_url} />
              <ImageInput name="hero_image" label="Portada (fondo grande del inicio)" current={settings.hero_image_url} />
            </div>
            <h3>Fotos de la sección &ldquo;Nosotros&rdquo;</h3>
            <div className="form-grid two">
              <ImageInput name="about_photo_1" label="Foto 1" current={settings.about_photo_1_url} />
              <ImageInput name="about_photo_2" label="Foto 2" current={settings.about_photo_2_url} />
              <ImageInput name="about_photo_3" label="Foto 3" current={settings.about_photo_3_url} />
            </div>

            <h2>Apariencia y venta</h2>
            <div className="form-grid two">
              <div className="field">
                <label htmlFor="primary-color">Color principal</label>
                <input id="primary-color" className="input" name="primary_color" type="color" defaultValue={settings.primary_color} />
              </div>
              <div className="field">
                <label htmlFor="secondary-color">Color secundario</label>
                <input id="secondary-color" className="input" name="secondary_color" type="color" defaultValue={settings.secondary_color} />
              </div>
              <div className="field">
                <label htmlFor="currency">Moneda (ej. ARS, USD)</label>
                <input id="currency" className="input" name="currency" autoCapitalize="characters" minLength={3} maxLength={3} pattern="[A-Za-z]{3}" defaultValue={settings.currency} />
              </div>
            </div>
            <label className="checkbox">
              <input name="show_prices" type="checkbox" defaultChecked={settings.show_prices} />
              Mostrar precios
            </label>
            <label className="checkbox">
              <input name="business_open" type="checkbox" defaultChecked={settings.business_open} />
              El negocio está abierto
            </label>
            <FormSubmitButton pendingText="Guardando configuración…" fullWidth>Guardar cambios</FormSubmitButton>
          </PendingFormFields>
        </form>
      </details>

      <h2>Resumen</h2>
      <div className="grid-cards summary-cards">
        {[
          ["Productos", products],
          ["Categorías", categories],
          ["Disponibles", available],
          ["Destacados", featured],
        ].map(([label, count]) => (
          <div className="card" style={{ padding: "1.1rem" }} key={label}>
            <RoughFrame shape={ABOUT_FRAME} />
            <CheckCircle size={20} color="var(--secondary)" />
            <strong style={{ fontSize: "2rem", display: "block" }}>{count ?? 0}</strong>
            <span className="muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
