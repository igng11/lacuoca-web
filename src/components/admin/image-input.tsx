"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { formatFileSize, imageSelectionError, MAX_IMAGE_SIZE_LABEL } from "@/lib/image-validation";

export function ImageInput({ id, name, label, current }: { id?: string; name: string; label: string; current?: string | null }) {
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
      <input
        ref={inputRef}
        className="input file-input"
        id={inputId}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        aria-describedby={`${helpId}${error ? ` ${errorId}` : ""}`}
        aria-invalid={Boolean(error)}
        onChange={(event) => {
          const file = event.target.files?.[0];
          setError("");
          setFileDetails("");
          if (!file) return;
          const validationError = imageSelectionError(file);
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
      <small id={helpId} className="muted">JPG, PNG o WebP. Máximo {MAX_IMAGE_SIZE_LABEL}.</small>
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
