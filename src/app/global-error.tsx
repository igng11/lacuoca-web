"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="es">
      <body>
        <main className="container section empty">
          <h1>No pudimos abrir el sitio</h1>
          <p>El servicio de datos no está disponible en este momento. Intentá nuevamente en unos minutos.</p>
          <button className="btn btn-primary" onClick={reset}>Reintentar</button>
        </main>
      </body>
    </html>
  );
}
