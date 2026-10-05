import type { MetadataRoute } from "next";
import { SITE_URL, IS_PRODUCTION, PRIVATE_PATHS } from "@/lib/seo-config";

export default function robots(): MetadataRoute.Robots {
  // Production guard: non-production / staging / preview deployments must never be indexed
  if (!IS_PRODUCTION) {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: "/",
        },
      ],
    };
  }

  return {
    rules: [
      // 1. General web crawlers
      {
        userAgent: "*",
        allow: "/",
        disallow: [...PRIVATE_PATHS],
      },
      // 2. AI Retrieval & Citation Bots (Allowed for search discovery, GEO/AEO answers, and citations)
      {
        userAgent: [
          "OAI-SearchBot",
          "ChatGPT-User",
          "Claude-SearchBot",
          "PerplexityBot",
          "Applebot",
          "Bingbot",
        ],
        allow: "/",
        disallow: [...PRIVATE_PATHS],
      },
      // 3. AI Training Crawlers (Blocked from unauthorized content scraping & model training per policy)
      {
        userAgent: [
          "GPTBot",
          "ClaudeBot",
          "Google-Extended",
          "Applebot-Extended",
          "CCBot",
        ],
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
