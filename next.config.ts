import type { NextConfig } from "next";

export function buildContentSecurityPolicy(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let supabaseOrigin = "";
  if (supabaseUrl) {
    try {
      supabaseOrigin = new URL(supabaseUrl).origin;
    } catch {
      // ignore invalid URL
    }
  }

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": [
      "'self'",
      "blob:",
      "data:",
      "https://*.supabase.co",
      "https://cdn.discordapp.com",
      "https://media.discordapp.net",
      "https://i.scdn.co",
    ],
    "font-src": ["'self'", "data:"],
    "connect-src": [
      "'self'",
      "https://*.supabase.co",
      "wss://*.supabase.co",
    ],
    "media-src": [
      "'self'",
      "blob:",
      "data:",
      "https://*.supabase.co",
    ],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'self'"],
  };

  if (supabaseOrigin) {
    if (!directives["img-src"].includes(supabaseOrigin)) directives["img-src"].push(supabaseOrigin);
    if (!directives["connect-src"].includes(supabaseOrigin)) directives["connect-src"].push(supabaseOrigin);
    if (!directives["media-src"].includes(supabaseOrigin)) directives["media-src"].push(supabaseOrigin);
  }

  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(" ")};`)
    .join(" ");
}

export function getSecurityHeaders() {
  return [
    { key: "Content-Security-Policy", value: buildContentSecurityPolicy() },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
    },
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    },
  ];
}

export const securityHeaders = getSecurityHeaders();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: getSecurityHeaders() }];
  },
};

export default nextConfig;
