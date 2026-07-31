import { CategoryForm } from "@/components/admin/category-form";
import { Feedback } from "@/components/admin/feedback";
import { getCategories } from "@/services/catalog";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const message = await searchParams;
  const categories = await getCategories(true);
  return (
    <div className="stack">
      <div>
        <span className="eyebrow">Organización</span>
        <h1>Categorías</h1>
        <p className="muted">Creá categorías o tocá una de la lista para editarla.</p>
      </div>
      <Feedback {...message} />
      <details id="crear-categoria" className="card create-panel" open={!categories.length}>
        <summary>＋ Crear categoría</summary>
        <CategoryForm />
      </details>
      <div className="admin-list">
        {categories.map((category) => (
          <details className="card admin-item" key={category.id}>
            <summary>
              <strong>{category.name}</strong>
              <div className="muted">{category.active ? "Visible" : "Oculta"} · orden {category.display_order}</div>
            </summary>
            <CategoryForm category={category} />
          </details>
        ))}
        {!categories.length && (
          <div className="empty stack">
            <strong>Todavía no hay categorías.</strong>
            <p className="muted">Completá “Crear categoría” para agregar la primera y después cargar productos.</p>
            <a className="btn btn-primary" href="#crear-categoria">Ir al formulario</a>
          </div>
        )}
      </div>
    </div>
  );
}
