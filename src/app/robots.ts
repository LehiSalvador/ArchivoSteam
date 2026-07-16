import type { MetadataRoute } from "next";

const SITE_URL = "https://www.archivostem.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/cuenta", "/vista-previa", "/api", "/auth"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
