import type { Category, Product } from "@/types/database";
import { deleteProduct, saveProduct } from "@/app/admin/actions";
import { ConfirmButton } from "./confirm-button";
import { ImageInput } from "./image-input";
import { FormSubmitButton, PendingFormFields } from "./form-submit-button";

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const prefix = `product-${product?.id ?? "new"}`;
  return (
    <form action={saveProduct} className="stack" style={{ paddingTop: "1rem" }}>
      <input type="hidden" name="id" value={product?.id || ""} />
      <PendingFormFields>
      <div className="form-grid two">
        <div className="field">
          <label htmlFor={`${prefix}-name`}>Nombre *</label>
          <input id={`${prefix}-name`} className="input" name="name" defaultValue={product?.name} autoComplete="off" required />
        </div>
        <div className="field">
          <label htmlFor={`${prefix}-category`}>Categoría *</label>
          <select id={`${prefix}-category`} className="input" name="category_id" defaultValue={product?.category_id} required>
            <option value="">Elegir…</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${prefix}-price`}>Precio *</label>
          <input id={`${prefix}-price`} className="input" name="price" type="number" inputMode="decimal" min="0" step=".01" defaultValue={product?.price ?? 0} required />
        </div>
        <div className="field">
          <label htmlFor={`${prefix}-order`}>Orden</label>
          <input id={`${prefix}-order`} className="input" name="display_order" type="number" inputMode="numeric" min="0" step="1" defaultValue={product?.display_order ?? 0} />
        </div>
      </div>
      <div className="field">
        <label htmlFor={`${prefix}-short-description`}>Descripción corta</label>
        <input id={`${prefix}-short-description`} className="input" name="short_description" maxLength={180} defaultValue={product?.short_description || ""} />
      </div>
      <div className="field">
        <label htmlFor={`${prefix}-description`}>Descripción completa</label>
        <textarea id={`${prefix}-description`} className="input" name="description" rows={4} defaultValue={product?.description || ""} />
      </div>
      <div className="field">
        <label htmlFor={`${prefix}-flavors`}>Sabores (uno por línea)</label>
        <textarea
          id={`${prefix}-flavors`}
          className="input"
          name="flavors"
          rows={4}
          placeholder={"Mozzarella y cebolla\nTomate y mozzarella\nCalabaza"}
          defaultValue={product?.flavors?.join("\n") || ""}
        />
        <small className="muted">Si cargás al menos uno, el visitante va a tener que elegir un sabor antes de agregar al carrito. Dejalo vacío si el producto no tiene variantes.</small>
      </div>
      <ImageInput id={`${prefix}-image`} name="image" label="Foto del producto" current={product?.image_url} />
      <div className="form-grid two">
        {[
          ["available", "Disponible", product?.available ?? true],
          ["featured", "Destacado", product?.featured ?? false],
          ["active", "Visible en el catálogo", product?.active ?? true],
        ].map(([name, label, checked]) => (
          <label className="checkbox" key={String(name)}>
            <input name={String(name)} type="checkbox" defaultChecked={Boolean(checked)} />
            {String(label)}
          </label>
        ))}
      </div>
      <FormSubmitButton
        pendingText={product ? "Actualizando producto…" : "Guardando producto…"}
        disabled={!categories.length}
        fullWidth
      >
        {categories.length ? (product ? "Guardar cambios" : "Guardar producto") : "Creá una categoría antes de guardar"}
      </FormSubmitButton>
      </PendingFormFields>
    </form>
  );
}

export function ProductDeleteForm({ product }: { product: Product }) {
  return (
    <form id={`delete-${product.id}`} action={deleteProduct}>
      <input type="hidden" name="id" value={product.id} />
      <ConfirmButton />
    </form>
  );
}
