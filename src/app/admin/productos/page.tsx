import Link from "next/link";
import { Feedback } from "@/components/admin/feedback";
import { ProductDeleteForm, ProductForm } from "@/components/admin/product-form";
import { getCategories, getProducts } from "@/services/catalog";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string; q?: string; category?: string; availability?: string }>;
}) {
  const params = await searchParams;
  const [categories, allProducts] = await Promise.all([
    getCategories(true),
    getProducts({ includeInactive: true }),
  ]);
  const products = allProducts.filter((product) => (
    (!params.q || product.name.toLowerCase().includes(params.q.toLowerCase()))
    && (!params.category || product.category_id === params.category)
    && (!params.availability || (params.availability === "available" ? product.available : !product.available))
  ));
  const hasFilters = Boolean(params.q || params.category || params.availability);

  return (
    <div className="stack">
      <div>
        <span className="eyebrow">Catálogo</span>
        <h1>Productos</h1>
        <p className="muted">Creá productos o tocá uno de la lista para editarlo.</p>
      </div>
      <Feedback ok={params.ok} error={params.error} />
      {!categories.length && (
        <div className="orientation" role="status">
          <strong>Primero creá una categoría para poder agregar productos.</strong>
          <Link className="btn btn-soft" href="/admin/categorias">Ir a categorías</Link>
        </div>
      )}
      <details id="crear-producto" className="card create-panel" open={!allProducts.length && Boolean(categories.length)}>
        <summary>＋ Crear producto</summary>
        <ProductForm categories={categories} />
      </details>
      <form className="form-grid two filter-form" aria-label="Filtrar productos">
        <div className="field">
          <label htmlFor="product-search">Buscar</label>
          <input id="product-search" className="input" name="q" type="search" placeholder="Nombre del producto…" defaultValue={params.q} />
        </div>
        <div className="field">
          <label htmlFor="product-category">Categoría</label>
          <select id="product-category" className="input" name="category" defaultValue={params.category}>
            <option value="">Todas las categorías</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="product-availability">Disponibilidad</label>
          <select id="product-availability" className="input" name="availability" defaultValue={params.availability}>
            <option value="">Cualquier disponibilidad</option>
            <option value="available">Disponibles</option>
            <option value="unavailable">No disponibles</option>
          </select>
        </div>
        <div className="filter-actions">
          <button className="btn btn-soft">Aplicar filtros</button>
          {hasFilters && <Link className="text-button" href="/admin/productos">Limpiar filtros</Link>}
        </div>
      </form>
      <div className="admin-list">
        {products.map((product) => (
          <details className="card admin-item" key={product.id}>
            <summary>
              <strong>{product.name}</strong>
              <div className="muted">{product.category?.name} · {product.available ? "Disponible" : "No disponible"}</div>
            </summary>
            <ProductForm product={product} categories={categories} />
            <ProductDeleteForm product={product} />
          </details>
        ))}
        {!products.length && (
          <div className="empty stack">
            <strong>{hasFilters ? "No encontramos productos con esos filtros." : "Todavía no hay productos."}</strong>
            <p className="muted">{hasFilters ? "Probá limpiar la búsqueda para ver todos." : "Tocá “Crear producto” para agregar el primero."}</p>
            {hasFilters
              ? <Link className="btn btn-soft" href="/admin/productos">Limpiar filtros</Link>
              : categories.length > 0 && <a className="btn btn-primary" href="#crear-producto">Ir al formulario</a>}
          </div>
        )}
      </div>
    </div>
  );
}
