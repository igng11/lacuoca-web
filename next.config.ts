import type { NextConfig } from "next";

const remotePatterns: NonNullable<
  NextConfig["images"]
>["remotePatterns"] = [];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (supabaseUrl && !supabaseUrl.includes("YOUR_PROJECT")) {
  try {
    const parsed = new URL(supabaseUrl);

    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      remotePatterns.push({
        protocol: parsed.protocol.slice(0, -1) as "http" | "https",
        hostname: parsed.hostname,
        port: parsed.port,
        pathname: "/storage/v1/object/public/**",
      });
    }
  } catch {
    // Los valores inválidos se informan en tiempo de ejecución.
  }
}

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },

  images: {
    remotePatterns,
    // El logo acepta SVG (ver lib/storage.ts sanitizeSvg). Next bloquea SVG en
    // su optimizador por defecto porque puede traer <script> embebido; esta
    // CSP es la mitigación que la propia documentación de Next recomienda:
    // sirve el SVG en un contexto que no puede ejecutar scripts ni objetos.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;