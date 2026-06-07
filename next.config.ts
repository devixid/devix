import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const isDev = process.env.NODE_ENV === "development";

// CSP is only sent in production builds (see headers() below). Third-party
// checkout widgets must be allowlisted explicitly — default-src 'self' blocks
// their scripts/iframes/fetches when frame-src/connect-src are omitted.
// Turnstile: https://developers.cloudflare.com/turnstile/reference/content-security-policy/
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com https://js.stripe.com https://va.vercel-scripts.com;
  style-src 'self' 'unsafe-inline' https://challenges.cloudflare.com;
  img-src 'self' blob: data: https:;
  font-src 'self' data:;
  connect-src 'self' https://challenges.cloudflare.com https://api.stripe.com https://vitals.vercel-insights.com;
  frame-src 'self' https://challenges.cloudflare.com https://js.stripe.com https://hooks.stripe.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_SECRET",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(
      `Missing required environment variable: ${envVar}\n` +
        `Make sure it's set in your .env.local or deployment environment.`,
    );
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    qualities: [25, 50, 75, 100],
  },
  cacheComponents: false,
  reactCompiler: true,
  typedRoutes: true,
  experimental: {
    typedEnv: true,
  },
  turbopack: {
    resolveAlias: {
      canvas: "./empty-module.ts",
    },
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  compiler: {
    styledComponents: false,
  },
  ...(isDev
    ? {}
    : {
        async headers() {
          return [
            {
              source: "/(.*)",
              headers: [
                {
                  key: "Content-Security-Policy",
                  value: cspHeader.replace(/\n/g, "").trim(),
                },
                {
                  key: "X-DNS-Prefetch-Control",
                  value: "on",
                },
                {
                  key: "X-Content-Type-Options",
                  value: "nosniff",
                },
                {
                  key: "X-Frame-Options",
                  value: "DENY",
                },
                {
                  key: "Referrer-Policy",
                  value: "strict-origin-when-cross-origin",
                },
                {
                  key: "Permissions-Policy",
                  value:
                    "geolocation=(), microphone=(), camera=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=()",
                },
                {
                  key: "Cross-Origin-Embedder-Policy",
                  value: "credentialless",
                },
                {
                  key: "Cross-Origin-Opener-Policy",
                  value: "same-origin",
                },
                {
                  key: "Cross-Origin-Resource-Policy",
                  value: "same-origin",
                },
                {
                  key: "X-Permitted-Cross-Domain-Policies",
                  value: "none",
                },
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains; preload",
                },
              ],
            },
            {
              source: "/sw.js",
              headers: [
                {
                  key: "Service-Worker-Allowed",
                  value: "/",
                },
                {
                  key: "Cache-Control",
                  value: "public, max-age=0, must-revalidate",
                },
              ],
            },
            {
              source: "/:path*\\.(ico|png|jpg|jpeg|gif|webp|svg|css|js)",
              headers: [
                {
                  key: "Cache-Control",
                  value: "public, max-age=31536000, immutable",
                },
              ],
            },
          ];
        },
      }),
};

export default withBundleAnalyzer(nextConfig);
