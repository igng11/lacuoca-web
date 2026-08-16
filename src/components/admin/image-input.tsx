"use client";
import Image from "next/image";
import { Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatFileSize, imageSelectionError, MAX_IMAGE_SIZE_LABEL } from "@/lib/image-validation";

export function ImageInput({ id, name, label, current, allowSvg = false }: { id?: string; name: string; label: string; current?: string | null; allowSvg?: boolean }) {
  const [preview, setPreview] = useState(current || "");
  const [objectUrl, setObjectUrl] = useState("");
  const [fileDetails, setFileDetails] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = id || name;
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;

  useEffect(() => () => { if (objectUrl) URL.revokeObjectURL(objectUrl); }, [objectUrl]);

  function clearSelection() {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    if (inputRef.current) inputRef.current.value = "";
    setObjectUrl("");
    setPreview(current || "");
    setFileDetails("");
    setError("");
    inputRef.current?.focus();
  }

  return (
    <div className="field image-field">
      <label htmlFor={inputId}>{label}</label>
      {preview && (
        <div className="image-preview">
          <Image src={preview} alt={`Vista previa de ${label.toLowerCase()}`} fill sizes="240px" />
        </div>
      )}
      <div className="image-upload-row">
        {/* El botón nativo del input (::file-selector-button) no se puede
            renombrar por CSS: siempre dice el texto genérico del navegador
            ("Elegir archivo"), sin decir para qué es. Este label hace de botón
            visible y claro; el input real queda oculto pero sigue siendo
            focuseable y accesible por teclado. */}
        <label htmlFor={inputId} className="btn btn-soft image-upload-btn">
          <Upload size={16} aria-hidden="true" />
          {preview ? "Cambiar imagen" : "Elegir imagen"}
        </label>
        <input
          ref={inputRef}
          className="image-upload-input"
          id={inputId}
          name={name}
          type="file"
          accept={allowSvg ? "image/jpeg,image/png,image/webp,image/svg+xml" : "image/jpeg,image/png,image/webp"}
          aria-describedby={`${helpId}${error ? ` ${errorId}` : ""}`}
          aria-invalid={Boolean(error)}
          onChange={(event) => {
            const file = event.target.files?.[0];
            setError("");
            setFileDetails("");
            if (!file) return;
            const validationError = imageSelectionError(file, allowSvg);
            if (validationError) {
              setError(validationError);
              event.currentTarget.value = "";
              setPreview(current || "");
              return;
            }
            if (objectUrl) URL.revokeObjectURL(objectUrl);
            const next = URL.createObjectURL(file);
            setObjectUrl(next);
            setPreview(next);
            setFileDetails(`${file.name} · ${formatFileSize(file.size)}`);
          }}
        />
      </div>
      <small id={helpId} className="muted">{allowSvg ? "JPG, PNG, WebP o SVG." : "JPG, PNG o WebP."} Máximo {MAX_IMAGE_SIZE_LABEL}.</small>
      {fileDetails && (
        <div className="selected-file">
          <span>{fileDetails}</span>
          <button type="button" className="text-button" onClick={clearSelection}>Quitar imagen seleccionada</button>
        </div>
      )}
      {error && <small id={errorId} className="field-error" role="alert">{error}</small>}
      {fileDetails && <small className="muted">La imagen se subirá al guardar y puede tardar algunos segundos.</small>}
    </div>
  );
}
