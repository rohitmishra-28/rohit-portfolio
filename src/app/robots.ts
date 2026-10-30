import type { MetadataRoute } from "next";
import { siteUrl } from "@/content";

// /robots.txt. Crawlers only read it at the root of a domain, so it takes
// effect once the site is on its own domain; under a GitHub Pages sub-path
// it's harmless. Nothing is disallowed: the CMS pages say noindex
// themselves, which crawlers can only see if they may fetch them.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    ...(siteUrl && { sitemap: `${siteUrl}/sitemap.xml` }),
  };
}
