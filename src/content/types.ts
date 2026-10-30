// Shapes of the JSON files in /content. The CMS (src/admin) edits these files
// and the sections render them. Image fields hold a name from the generated
// image manifest (src/lib/images.generated.ts); file fields hold a path in
// /public, e.g. "/resume.pdf". Title lines may wrap words in *asterisks* to
// set them in the section's accent colour.

/** A destination: "#section", "https://…", "mailto:…", "/file.pdf", or one
 * of the site shortcuts "site:resume", "site:email", "site:linkedin",
 * "site:github" (resolved from site settings, see links.ts). */
export type Href = string;

export type Cta = { label: string; href: Href };

export type SiteContent = {
  /** Short name for the logo and footer. */
  name: string;
  /** Full name for search engines: titles, structured data. */
  fullName: string;
  /** Other spellings, comma separated. */
  alternateNames: string;
  role: string;
  /** One-paragraph bio for structured data (Person.description). */
  summary: string;
  locality: string;
  region: string;
  /** ISO country code, e.g. IN. */
  country: string;
  employer: string;
  education: string;
  /** Skills for structured data, comma separated. */
  knowsAbout: string;
  email: string;
  emailSubject: string;
  linkedin: string;
  github: string;
  resume: string;
  resumeDownloadName: string;
  seoTitle: string;
  seoDescription: string;
  shareImage: string;
  shareImageAlt: string;
  nav: Cta[];
};

export type HeroContent = {
  eyebrow: string;
  title: string[];
  lede: string;
  primaryCta: Cta;
  secondaryCta: Cta;
  scrollLabel: string;
  image: string;
  imageDesktop: string;
  imageAlt: string;
};

export type AboutContent = {
  number: string;
  marker: string;
  title: string[];
  bio: string;
  highlights: { label: string; title: string; short: string; icon: string }[];
  cta: Cta;
  image: string;
  imageAlt: string;
};

export type JourneyChapter = {
  /** Small label above the figure, e.g. "The beginning". */
  label: string;
  tagline: string;
  dates: string;
  location: string;
  /** Text shown in the logo tile while there is no logo. */
  badge: string;
  /** Optional logo image; empty = the badge text is shown. */
  logo: string;
  role: string;
  company: string;
  points: { title: string; body: string }[];
};

export type JourneyContent = {
  eyebrow: string;
  title: string[];
  intro: string;
  introMobile: string;
  chapterLabel: string;
  /** Counter label for the last chapter, the role held now. */
  currentLabel: string;
  workLabel: string;
  scrollHint: string;
  figure: string;
  figureAlt: string;
  background: string;
  /** Phones get their own, portrait scene. */
  backgroundMobile: string;
  /** Oldest first: the scroll runs from the beginning to today. */
  chapters: JourneyChapter[];
};

export type Project = {
  name: string;
  title: string;
  stack: string;
  focus: string;
  tags: string;
  image: string;
  imageAlt: string;
  /** Live site; empty = the card isn't a link. */
  href: string;
};

export type WorkContent = {
  number: string;
  marker: string;
  title: string[];
  intro: string;
  introMobile: string;
  cta: Cta;
  note: string;
  background: string;
  projects: Project[];
};

export type ExpertiseContent = {
  number: string;
  marker: string;
  title: string[];
  cards: {
    title: string;
    skills: string;
    /** Mobile wording; empty = same as desktop. */
    skillsMobile: string;
    tone: "linen" | "forest" | "sand";
    emblem: string;
    image: string;
    imageAlt: string;
  }[];
};

export type PhilosophyContent = {
  number: string;
  marker: string;
  title: string[];
  statement: string;
  statementMobile: string;
  image: string;
  principles: { glyph: string; title: string; tagline: string; body: string; short: string }[];
};

export type ProcessContent = {
  number: string;
  marker: string;
  title: string;
  steps: { title: string; body: string; image: string; imageAlt: string }[];
  note: string;
};

export type SignatureContent = {
  eyebrow: string[];
  title: string[];
  body: string;
  bodyMobile: string;
  image: string;
};

export type ContactContent = {
  number: string;
  marker: string;
  markerMobile: string;
  title: string;
  subtitle: string;
  titleMobile: string;
  copy: string;
  copyMobile: string;
  emailLabel: string;
  emailLabelMobile: string;
  resumeLabel: string;
  signoff: string;
  namaste: string;
  video: string;
  videoPoster: string;
  videoLabel: string;
};

export type FooterContent = {
  role: string;
  tagline: string;
  navigationHeading: string;
  homeLabel: string;
  workHeading: string;
  viewAllLabel: string;
  viewAllHref: Href;
  resourcesHeading: string;
  resources: Cta[];
  quote: string;
  copyright: string;
  credit: string;
};

/** Every brand Rohit has built for, by market. Not rendered yet: kept for
 * the upcoming all-projects page. Empty href = URL still to come. */
export type ClientsContent = {
  groups: {
    region: string;
    clients: { name: string; sites: { label: string; href: string }[] }[];
  }[];
};

export type SiteContentMap = {
  site: SiteContent;
  hero: HeroContent;
  about: AboutContent;
  journey: JourneyContent;
  work: WorkContent;
  expertise: ExpertiseContent;
  philosophy: PhilosophyContent;
  process: ProcessContent;
  signature: SignatureContent;
  contact: ContactContent;
  footer: FooterContent;
  clients: ClientsContent;
};

export type ContentKey = keyof SiteContentMap;
