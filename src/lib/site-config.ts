// Every destination on the site lives here. Only verified values belong in this
// file — leave a field `null` until it is confirmed, and components render it
// as plain text (never `href="#"`).

export const siteConfig = {
  name: "Rohit Mishra",
  // Final domain not chosen yet. When null, canonical/Open Graph URLs are omitted.
  url: null as string | null,

  email: "irohitm89@gmail.com",
  emailSubject: "Hello from your portfolio",

  resume: {
    href: "/resume.pdf",
    downloadName: "Rohit-Mishra-Resume.pdf",
  },

  social: {
    linkedin: "https://www.linkedin.com/in/rkmishra89/",
    github: "https://github.com/rohitmishra-28",
  },
} as const;

export const mailtoHref = `mailto:${siteConfig.email}?subject=${encodeURIComponent(
  siteConfig.emailSubject,
)}`;

// Header and footer share these so their destinations always match.
export const sectionLinks = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Expertise", href: "#expertise" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
] as const;

// CTAs whose destinations aren't in the Figma link map; confirmed in chat.
export const ctaLinks = {
  viewAllProjects: "#work",
  moreAboutMe: siteConfig.resume.href,
} as const;
