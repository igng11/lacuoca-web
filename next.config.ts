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
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;