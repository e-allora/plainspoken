import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The directory above this repo has its own lockfile, so Turbopack infers the
  // wrong workspace root and fails to resolve `next`. Pin it to this project.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
  // From docs/2026-07-14-deployment.md. Strict-Transport-Security is left out on
  // purpose: Vercel already sends a longer one (2 years) than the doc's (1 year).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
