// Featured projects. Shaped so a CMS can populate it later; card copy is filled
// in from the Figma frames when the Featured Work section is built.

export type Project = {
  slug: string;
  name: string;
  // Verified case-study or live URL. null = card is intentionally non-clickable.
  href: string | null;
};

export const projects: Project[] = [
  { slug: "tarinika", name: "Tarinika", href: null },
  { slug: "paksha", name: "Paksha", href: null },
  { slug: "novology", name: "Novology", href: null },
];
