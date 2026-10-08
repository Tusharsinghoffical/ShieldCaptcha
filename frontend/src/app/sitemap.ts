import type { MetadataRoute } from "next";
import { SITE_URL, CANONICAL_ROUTES, IS_PRODUCTION } from "@/lib/seo-config";

// Versioned content milestone date for genuine lastmod tracking
const LAST_UPDATED = new Date("2026-10-08T18:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  // Staging guard: Do not advertise URLs for non-production domains
  if (!IS_PRODUCTION) {
    return [];
  }

  return CANONICAL_ROUTES.map((route) => {
    const url = route.path ? `${SITE_URL}/${route.path}` : `${SITE_URL}/`;
    return {
      url,
      lastModified: LAST_UPDATED,
      changeFrequency: route.changefreq as MetadataRoute.Sitemap[number]["changeFrequency"],
      priority: parseFloat(route.priority),
    };
  });
}

