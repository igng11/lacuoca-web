import type { Metadata } from "next";
import "./globals.css";
import { readableAccent, textColorOn } from "@/lib/color";
import { getSiteUrl } from "@/lib/env";
import { getSettings } from "@/services/catalog";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const description = settings.description || "Catálogo gastronómico";
  const siteUrl = getSiteUrl();
  return {
    metadataBase: new URL(siteUrl), title: { default: settings.business_name, template: `%s | ${settings.business_name}` },
    description, openGraph: { title: settings.business_name, description, type: "website", images: settings.hero_image_url ? [settings.hero_image_url] : [] },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();
  const style = {
    "--primary": settings.primary_color,
    "--secondary": settings.secondary_color,
    "--primary-readable": readableAccent(settings.primary_color),
    "--on-primary": textColorOn(settings.primary_color),
    "--on-secondary": textColorOn(settings.secondary_color),
  } as React.CSSProperties;
  return <html lang="es"><body style={style}>{children}</body></html>;
}
