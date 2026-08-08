import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"

// Single-page site — the section anchors are not separate URLs, so there is one entry.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ]
}
