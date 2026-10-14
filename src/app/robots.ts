import type { MetadataRoute } from "next";

import { getSiteUrl, isIndexingAllowed } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  // Até a publicação oficial, nada é indexado (conteúdo ainda provisório).
  if (!isIndexingAllowed() || !siteUrl) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
