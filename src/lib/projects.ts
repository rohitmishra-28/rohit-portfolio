import type { ImageName } from "./images.generated";

// Featured projects (copy from Figma 11:85 / 120:23). Shaped so a CMS can
// populate it later.

export type Project = {
  slug: string;
  name: string;
  /** Desktop card headline. */
  title: string;
  /** Desktop stack line. */
  stack: string;
  /** Desktop focus line. */
  focus: string;
  /** Mobile card tags. */
  tags: string;
  image: ImageName;
  imageAlt: string;
  // Verified case-study or live URL. null = card is intentionally non-clickable.
  href: string | null;
};

export const projects: Project[] = [
  {
    slug: "tarinika",
    name: "Tarinika",
    title: "Tradition in every weave",
    stack: "Shopify · Liquid · Theme development",
    focus: "Shopify theme engineering",
    tags: "Ecommerce · Shopify",
    image: "project-tarinika",
    imageAlt: "Gold temple-style necklace and jhumka earrings on a silk sari.",
    href: null,
  },
  {
    slug: "paksha",
    name: "Paksha",
    title: "Modern Ayurveda",
    stack: "Shopify · JavaScript · UX implementation",
    focus: "Frontend implementation",
    tags: "Wellness · Shopify",
    image: "project-paksha",
    imageAlt: "Ayurvedic oils, herbs and a stone mortar and pestle among green leaves.",
    href: null,
  },
  {
    slug: "novology",
    name: "Novology",
    title: "Science-backed care",
    stack: "Shopify · Frontend development",
    focus: "Ecommerce experience",
    tags: "Skincare · Commerce",
    image: "project-novology",
    imageAlt: "Skincare serums and a cream jar on stone blocks beside lab glassware.",
    href: null,
  },
];
