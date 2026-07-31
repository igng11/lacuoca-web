import Link from "next/link";
export default function NotFound(){return <main className="container section empty"><h1>No encontramos esa página</h1><p className="muted">Puede que el producto ya no esté publicado.</p><Link className="btn btn-primary" href="/catalogo">Ver catálogo</Link></main>}
