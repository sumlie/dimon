import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

loadEnvConfig(process.cwd());

const nextConfig: NextConfig = {
  allowedDevOrigins: (process.env.ALLOWED_DEV_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  async rewrites() {
    const adminApiUrl = (
      process.env.ADMIN_API_URL || "http://localhost:3001"
    ).replace(/\/+$/, "");

    return [
      {
        source: "/api/auth/:path*",
        destination: `${adminApiUrl}/api/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
