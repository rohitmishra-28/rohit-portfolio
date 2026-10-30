import type { MetadataRoute } from "next";
import { siteUrl } from "@/content";

// /sitemap.xml, written at build time. Lists the public pages only (the CMS
// at /admin is noindex). Needs the absolute site URL, which the deploy
// workflow provides; local builds without it get an empty sitemap.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteUrl) return [];
  return [{ url: `${siteUrl}/`, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
