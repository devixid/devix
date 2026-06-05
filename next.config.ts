import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

import crypto from "crypto";

const faqs = [
  {
    question: "What services and products do you offer?",
    answer:
      "We offer comprehensive custom web development (company profiles, e-commerce platforms, landing pages) and custom mobile applications tailored to your business needs.",
  },
  {
    question: "How much experience do you have with IT projects?",
    answer:
      "Our team members have worked on various digital products for businesses across Indonesia, delivering highly optimized, secure, and production-ready applications.",
  },
  {
    question: "How long does a typical project take?",
    answer:
      "A standard website project takes between 2 to 4 weeks depending on the complexity of requirements and design iterations.",
  },
  {
    question: "Should I create a mobile or a web app?",
    answer:
      "It depends on your audience. Websites are perfect for discovery and broad reach, while mobile apps are ideal for retaining repeat customers and providing offline capabilities.",
  },
  {
    question: "What technologies do you use in development?",
    answer:
      "We primarily develop websites using Next.js, React, TailwindCSS, and Node.js, and integrate databases using Supabase and Prisma for maximum speed and security.",
  },
  {
    question: "What do I need to prepare before contacting you?",
    answer:
      "Just your business idea and goals! Having your brand guidelines, logo files, and content copy ready will help speed up the process, but we are happy to guide you from scratch.",
  },
];

const faqJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
});

const faqHash = crypto.createHash("sha256").update(faqJsonLd).digest("base64");

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' 'sha256-${faqHash}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self' data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

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

export default nextConfig;
