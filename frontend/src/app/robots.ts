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
      // 1. Googlebot explicitly permitted
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [...PRIVATE_PATHS],
      },
      // 2. General web crawlers
      {
        userAgent: "*",
        allow: "/",
        disallow: [...PRIVATE_PATHS],
      },
      // 2. AI Search, Retrieval & Citation Bots (Allowed for full GEO/AEO discoverability)
      {
        userAgent: [
          "OAI-SearchBot",
          "ChatGPT-User",
          "GPTBot",
          "Claude-SearchBot",
          "ClaudeBot",
          "PerplexityBot",
          "Applebot",
          "Applebot-Extended",
          "Bingbot",
          "Google-Extended",
          "cohere-ai",
          "Amazonbot",
        ],
        allow: "/",
        disallow: [...PRIVATE_PATHS],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
