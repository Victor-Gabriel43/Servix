import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/config/site";

/** O sitemap exige URLs absolutas: só é gerado com o domínio oficial definido. */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return [];

  return [
    { url: new URL("/", siteUrl).toString(), changeFrequency: "monthly", priority: 1 },
    { url: new URL("/privacidade", siteUrl).toString(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
