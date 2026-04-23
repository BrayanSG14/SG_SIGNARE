import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Opcional: si también hay errores de TypeScript
  },
};

export default nextConfig;