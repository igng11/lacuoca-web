"use client";

import { LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type ButtonVariant = "primary" | "secondary" | "soft" | "danger";

export function FormSubmitButton({
  children,
  pendingText,
  variant = "primary",
  icon,
  disabled = false,
  fullWidth = false,
}: {
  children: ReactNode;
  pendingText: string;
  variant?: ButtonVariant;
  icon?: ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
}) {
  const { pending } = useFormStatus();
  const unavailable = disabled || pending;

  return (
    <button
      type="submit"
      className={`btn btn-${variant} form-submit${fullWidth ? " full-width" : ""}`}
      disabled={unavailable}
      aria-disabled={unavailable}
      aria-busy={pending}
      data-pending={pending || undefined}
    >
      <span className="submit-label">
        <span className="submit-idle">{icon}{children}</span>
        <span className="submit-pending">
          <LoaderCircle className="spinner" size={18} aria-hidden="true" />
          {pendingText}
        </span>
      </span>
    </button>
  );
}

export function PendingFormFields({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <fieldset className="form-fieldset" disabled={pending} aria-busy={pending}>
      {children}
    </fieldset>
  );
}
