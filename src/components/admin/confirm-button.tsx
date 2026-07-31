"use client";
import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

export function ConfirmButton({ label = "Eliminar" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn-danger form-submit"
      disabled={pending}
      aria-disabled={pending}
      aria-busy={pending}
      data-pending={pending || undefined}
      onClick={(event) => {
        if (!pending && !confirm("¿Seguro que querés eliminarlo? Esta acción no se puede deshacer.")) {
          event.preventDefault();
        }
      }}
    >
      <span className="submit-label">
        <span className="submit-idle">{label}</span>
        <span className="submit-pending"><LoaderCircle className="spinner" size={18} aria-hidden="true" />Eliminando…</span>
      </span>
    </button>
  );
}
