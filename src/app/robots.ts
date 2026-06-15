import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://devixid.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/estimate/share/",
        "/download/",
        "/store/success",
        "/store/cancel",
        "/store/checkout",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
