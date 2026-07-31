import type { Category } from "@/types/database";
import { deleteCategory, saveCategory } from "@/app/admin/actions";
import { ConfirmButton } from "./confirm-button";
import { FormSubmitButton, PendingFormFields } from "./form-submit-button";

export function CategoryForm({ category }: { category?: Category }) {
  const prefix = `category-${category?.id ?? "new"}`;
  return (
    <div className="stack" style={{ paddingTop: "1rem" }}>
      <form action={saveCategory} className="stack">
        <input type="hidden" name="id" value={category?.id || ""} />
        <PendingFormFields>
        <div className="field">
          <label htmlFor={`${prefix}-name`}>Nombre *</label>
          <input id={`${prefix}-name`} className="input" name="name" autoComplete="off" required maxLength={80} defaultValue={category?.name} />
        </div>
        <div className="field">
          <label htmlFor={`${prefix}-description`}>Descripción</label>
          <textarea id={`${prefix}-description`} className="input" name="description" rows={3} defaultValue={category?.description || ""} />
        </div>
        <div className="field">
          <label htmlFor={`${prefix}-order`}>Orden</label>
          <input id={`${prefix}-order`} className="input" name="display_order" type="number" inputMode="numeric" min="0" step="1" defaultValue={category?.display_order ?? 0} />
        </div>
        <label className="checkbox">
          <input name="active" type="checkbox" defaultChecked={category?.active ?? true} />
          Visible en el catálogo
        </label>
        <FormSubmitButton pendingText={category ? "Actualizando categoría…" : "Creando categoría…"} fullWidth>
          {category ? "Guardar cambios" : "Crear categoría"}
        </FormSubmitButton>
        </PendingFormFields>
      </form>
      {category && (
        <form action={deleteCategory}>
          <input type="hidden" name="id" value={category.id} />
          <ConfirmButton />
        </form>
      )}
    </div>
  );
}
