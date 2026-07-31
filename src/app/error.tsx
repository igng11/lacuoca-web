"use client";
export default function ErrorPage({ reset }: { reset:()=>void }) { return <main className="container section empty"><h1>Algo salió mal</h1><p className="muted">No pudimos cargar la información. Intentá nuevamente.</p><button className="btn btn-primary" onClick={reset}>Reintentar</button></main>; }
