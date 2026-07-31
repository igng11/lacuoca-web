"use client";

import { CircleCheck, CircleX } from "lucide-react";
import { useEffect, useRef } from "react";

export function Feedback({ ok, error }: { ok?: string; error?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const message = error || ok;

  useEffect(() => {
    if (!message) return;
    const frame = requestAnimationFrame(() => {
      ref.current?.focus({ preventScroll: true });
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return () => cancelAnimationFrame(frame);
  }, [message]);

  if (!message) return null;
  const Icon = error ? CircleX : CircleCheck;
  return (
    <div
      ref={ref}
      className={`feedback ${error ? "feedback-error" : "feedback-success"}`}
      role={error ? "alert" : "status"}
      aria-live={error ? "assertive" : "polite"}
      tabIndex={-1}
    >
      <Icon size={22} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
