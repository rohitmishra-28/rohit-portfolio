import { SectionReveal } from "./SectionReveal";

// Footer / Heritage colophon (Figma "09 — Footer"). Content is built from the
// desktop and mobile frames in the section phase; destinations come from
// lib/site-config so they match the header.
export function SiteFooter() {
  return (
    <SectionReveal id="footer" as="footer" duration={340}>
      {null}
    </SectionReveal>
  );
}
