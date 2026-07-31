import { MessageCircle } from "lucide-react";

export function WhatsAppButton({ href, label = "Consultar por WhatsApp" }: { href: string | null; label?: string }) {
  if (!href) return null;
  return <a className="btn btn-secondary" href={href} target="_blank" rel="noreferrer"><MessageCircle size={20} />{label}</a>;
}
