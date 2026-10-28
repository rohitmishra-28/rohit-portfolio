// Build-time content: the JSON files in /content, edited through the CMS at
// /admin. Imported by the site's server components; a missing image name
// fails the build with a clear message instead of rendering a broken image.

import about from "../../content/about.json";
import clients from "../../content/clients.json";
import contact from "../../content/contact.json";
import expertise from "../../content/expertise.json";
import footer from "../../content/footer.json";
import hero from "../../content/hero.json";
import philosophy from "../../content/philosophy.json";
import processSteps from "../../content/process.json";
import signature from "../../content/signature.json";
import site from "../../content/site.json";
import work from "../../content/work.json";
import { images } from "@/lib/images.generated";
import { imageRefs } from "./refs";
import type { SiteContentMap } from "./types";

export const content = {
  site,
  hero,
  about,
  work,
  expertise,
  philosophy,
  process: processSteps,
  signature,
  contact,
  footer,
  clients,
} as SiteContentMap;

const missing = imageRefs(content).filter(([name]) => !(name in images));
if (missing.length) {
  throw new Error(
    `Content refers to images that aren't in the image manifest: ${missing
      .map(([name, where]) => `"${name}" (${where})`)
      .join(", ")}. Run \`npm run images\` after adding the source file to src/assets.`,
  );
}

/** Public address, set at build time (the deploy workflow passes the GitHub
 * Pages URL). When unset, canonical and absolute share URLs are omitted. */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || null;
