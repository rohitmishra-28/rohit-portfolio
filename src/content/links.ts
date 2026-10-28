import { asset } from "@/lib/base-path";
import type { Href, SiteContent } from "./types";

export type ResolvedLink = {
  href: string;
  /** Opens in a new tab. */
  external: boolean;
  /** File name to save as, for the résumé. */
  download?: string;
  /** Points at the résumé PDF. */
  resume: boolean;
};

export const mailtoHref = (site: SiteContent) =>
  `mailto:${site.email}?subject=${encodeURIComponent(site.emailSubject)}`;

/** Turns a content link (see Href) into what an <a> needs. */
export function resolveLink(value: Href, site: SiteContent): ResolvedLink {
  switch (value) {
    case "site:resume":
      return { href: asset(site.resume), external: false, download: site.resumeDownloadName, resume: true };
    case "site:email":
      return { href: mailtoHref(site), external: false, resume: false };
    case "site:linkedin":
      return { href: site.linkedin, external: true, resume: false };
    case "site:github":
      return { href: site.github, external: true, resume: false };
  }
  if (value.startsWith("/")) return { href: asset(value), external: false, resume: false };
  return { href: value, external: /^https?:\/\//.test(value), resume: false };
}
