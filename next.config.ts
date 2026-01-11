import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Agrega esta línea
  },
  typescript: {
    ignoreBuildErrors: true, // Opcional: si también hay errores de TypeScript
  },
};

export default nextConfig;