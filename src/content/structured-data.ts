import type { SiteContent } from "./types";

// schema.org JSON-LD for the homepage: who the site is about (Person), the
// site itself (WebSite) and the page as that person's profile (ProfilePage),
// linked by @id so search engines and AI answers read them as one entity.
// Everything comes from site settings in the CMS. Needs the absolute site
// URL, so it's omitted when that isn't known (local builds).

const list = (value: string) =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export function homeStructuredData(site: SiteContent, siteUrl: string) {
  const home = `${siteUrl}/`;
  const person = `${home}#person`;
  const website = `${home}#website`;
  const sameAs = [site.linkedin, site.github].filter((url) => /^https?:\/\//.test(url));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": person,
        name: site.fullName,
        alternateName: list(site.alternateNames),
        jobTitle: site.role,
        description: site.summary,
        url: home,
        image: `${siteUrl}${site.shareImage}`,
        email: `mailto:${site.email}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: site.locality,
          addressRegion: site.region,
          addressCountry: site.country,
        },
        ...(site.employer && { worksFor: { "@type": "Organization", name: site.employer } }),
        ...(site.education && { alumniOf: { "@type": "CollegeOrUniversity", name: site.education } }),
        knowsAbout: list(site.knowsAbout),
        sameAs,
      },
      {
        "@type": "WebSite",
        "@id": website,
        url: home,
        name: site.fullName,
        alternateName: `${site.name} — ${site.role}`,
        inLanguage: "en",
        publisher: { "@id": person },
      },
      {
        "@type": "ProfilePage",
        "@id": `${home}#profilepage`,
        url: home,
        name: site.seoTitle,
        isPartOf: { "@id": website },
        mainEntity: { "@id": person },
      },
    ],
  };
}

/** Serialises JSON-LD for a <script> tag; `<` is escaped so no string in the
 * content can close the tag early. */
export const jsonLd = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");
