import Link from "next/link";
import { Package, Tags, CheckCircle } from "lucide-react";
import { Feedback } from "@/components/admin/feedback";
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
      s.from("products").select("id, categories!inner(id)", { count: "exact", head: true })
        .eq("available", true).eq("active", true).eq("categories.active", true),
      s.from("products").select("id, categories!inner(id)", { count: "exact", head: true })
        .eq("featured", true).eq("active", true).eq("categories.active", true),
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
          <div className="muted">Datos e imágenes</div>
        </summary>
        <form action={saveSettings} className="stack">
          <PendingFormFields>
            <h2>Textos de la portada</h2>
            <div className="field">
              <label htmlFor="hero-title">Pre-título (texto rojo superior) *</label>
              <input id="hero-title" className="input" name="hero_title" required defaultValue={settings.hero_title} />
              <p className="muted">Aparece arriba del título principal, sin borde ni punto decorativo.</p>
            </div>
            <div className="field">
              <label htmlFor="hero-subtitle">Título principal (texto azul grande) *</label>
              <input id="hero-subtitle" className="input" name="hero_subtitle" required defaultValue={settings.hero_subtitle || ""} />
              <p className="muted">Es el encabezado principal visible en la portada.</p>
            </div>

            <h2>Datos generales del negocio</h2>
            <div className="field">
              <label htmlFor="business-name">Nombre del negocio *</label>
              <input id="business-name" className="input" name="business_name" required defaultValue={settings.business_name} />
              <p className="muted">Se usa en la pestaña del navegador, metadatos y como alternativa cuando no hay logo.</p>
            </div>
            <div className="field">
              <label htmlFor="business-description">Descripción general</label>
              <textarea id="business-description" className="input" name="description" rows={4} defaultValue={settings.description || ""} />
              <p className="muted">Se usa para buscadores y al compartir el sitio; no reemplaza el título de la portada.</p>
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

            <h2>Imágenes</h2>
            <div className="form-grid two">
              <ImageInput name="logo" label="Logo (se muestra en el menú de arriba)" current={settings.logo_url} allowSvg />
              <ImageInput name="hero_image" label="Imagen principal de la portada" current={settings.hero_image_url} />
            </div>
            <h3>Fotos de la sección &ldquo;Nosotros&rdquo;</h3>
            <div className="form-grid two">
              <ImageInput name="about_photo_1" label="Foto 1" current={settings.about_photo_1_url} />
              <ImageInput name="about_photo_2" label="Foto 2" current={settings.about_photo_2_url} />
              <ImageInput name="about_photo_3" label="Foto 3" current={settings.about_photo_3_url} />
            </div>

            <h2>Venta</h2>
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
          ["Disponibles visibles", available],
          ["Destacados visibles", featured],
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
