import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    // À retirer une fois les erreurs TS corrigées (ConfirmDialog, DashboardView, etc.)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
