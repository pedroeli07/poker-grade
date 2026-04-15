import type { NextConfig } from "next";
import { nodeEnv } from "./lib/constants/env";

const isDev = nodeEnv !== "production";

const csp = [
  "default-src 'self'",
  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https:",
  "font-src 'self'",
  "connect-src 'self' https://api.anthropic.com https://api.assemblyai.com https://api.elevenlabs.io",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  /**
   * Em desenvolvimento, Strict Mode desligado reduz render duplo de RSC e pedidos duplicados
   * (menos CPU, menos carga na BD). Em produção mantém-se ativo.
   */
  reactStrictMode: process.env.NODE_ENV === "production",
  /**
   * Permite HMR / recursos de dev quando o browser usa outro host (ex.: 127.0.0.1 vs localhost).
   * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
   */
  ...(isDev
    ? {
        allowedDevOrigins: ["127.0.0.1", "192.168.56.1"],
      }
    : {}),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
    /** Menos trabalho por import em libs com muitos exports nomeados (compilação mais rápida). */
    optimizePackageImports: ["lucide-react", "date-fns", "recharts", "radix-ui"],
    /** Reutiliza cache em disco entre arranques do `next dev` — menos recompilação. */
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
