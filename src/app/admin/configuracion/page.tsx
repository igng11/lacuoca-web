import { Feedback } from "@/components/admin/feedback";
import { ImageInput } from "@/components/admin/image-input";
import { saveSettings } from "@/app/admin/actions";
import { getSettings } from "@/services/catalog";
import { FormSubmitButton, PendingFormFields } from "@/components/admin/form-submit-button";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const [settings, message] = await Promise.all([getSettings(), searchParams]);
  return (
    <div className="stack">
      <div>
        <span className="eyebrow">Tu identidad</span>
        <h1>Información del negocio</h1>
        <p className="muted">Estos cambios se ven inmediatamente en el sitio público.</p>
      </div>
      <Feedback {...message} />
      <form action={saveSettings} className="card stack" style={{ padding: "clamp(1rem,4vw,2rem)" }}>
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
          <ImageInput name="logo" label="Logo" current={settings.logo_url} />
          <ImageInput name="hero_image" label="Imagen principal" current={settings.hero_image_url} />
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
    </div>
  );
}
