import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { getSiteUrl } from "@/lib/env";
import { getSettings } from "@/services/catalog";

const skinny = localFont({
  src: "./fonts/DHDSkinny-Regular.otf",
  variable: "--font-display",
  display: "swap",
});

const austie = localFont({
  src: "./fonts/Austie Bost Descriptions.ttf",
  variable: "--font-sans",
  display: "swap",
});

const smooches = localFont({
  src: "./fonts/SmoochesOfYou.ttf",
  variable: "--font-script",
  display: "swap",
});

const mess = localFont({
  src: "./fonts/clean up your mess.ttf",
  variable: "--font-mess",
  display: "swap",
});

const mission = localFont({
  src: "./fonts/missionpossible.ttf",
  variable: "--font-mission",
  display: "swap",
});

const fushia = localFont({
  src: "./fonts/PotionFushia.ttf",
  variable: "--font-fushia",
  display: "swap",
});

const pot = localFont({
  src: "./fonts/alittlepot.ttf",
  variable: "--font-pot",
  display: "swap",
});

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
  const fonts = [skinny.variable, austie.variable, smooches.variable, mess.variable, mission.variable, fushia.variable, pot.variable].join(" ");
  return <html lang="es" className={fonts}><body>{children}</body></html>;
}
