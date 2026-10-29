import type { ContentKey } from "@/content/types";
import type { IconName } from "./ui/Icon";

// What the CMS edits, section by section. Each section is one JSON file in
// /content; its cards group the fields the way the editor shows them. The
// field types map onto the editors in ui/fields.

type Base = {
  key: string;
  label: string;
  help?: string;
  /** May be left empty. */
  optional?: boolean;
};

export type Field =
  | (Base & { type: "text"; multiline?: boolean; placeholder?: string })
  /** Title lines; *asterisks* mark accent words. */
  | (Base & { type: "lines"; min?: number; max?: number })
  | (Base & { type: "link" })
  | (Base & { type: "image" })
  | (Base & { type: "file"; accept: string; kind: string })
  | (Base & { type: "select"; options: { label: string; value: string }[] })
  | (Base & { type: "group"; fields: Field[] })
  | (Base & {
      type: "list";
      /** Singular, for "Add highlight" and "Highlight 2". */
      itemName: string;
      itemTitle: (item: Record<string, unknown>) => string;
      fields: Field[];
      blank: () => Record<string, unknown>;
      min?: number;
      max?: number;
    });

export type SectionCard = { title: string; description?: string; fields: Field[] };

export type SectionDef = {
  id: ContentKey;
  title: string;
  description: string;
  icon: IconName;
  group: "sections" | "content" | "settings";
  /** Where the section sits on the page, for preview and "View on site". */
  anchor?: string;
  cards: SectionCard[];
};

const MOBILE = "Shown on phones. Leave empty to use the desktop text.";
const ACCENT = "One line per row. Wrap words in *asterisks* to set them in the accent colour.";

const sectionNumber: Field = {
  type: "text",
  key: "number",
  label: "Section number",
  help: "The small number before the label, e.g. 02.",
};

const cta = (key: string, label: string): Field => ({
  type: "group",
  key,
  label,
  fields: [
    { type: "text", key: "label", label: "Button label" },
    { type: "link", key: "href", label: "Link" },
  ],
});

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : "");

export const sections: SectionDef[] = [
  {
    id: "hero",
    title: "Hero",
    description: "The banner at the top of the homepage.",
    icon: "hero",
    group: "sections",
    anchor: "top",
    cards: [
      {
        title: "Heading",
        fields: [
          { type: "text", key: "eyebrow", label: "Eyebrow", help: "Small text above the headline." },
          { type: "lines", key: "title", label: "Headline", help: ACCENT, min: 1, max: 4 },
          { type: "text", key: "lede", label: "Supporting text", multiline: true },
        ],
      },
      {
        title: "Buttons",
        description: "The two links take turns in one button, rolling between labels.",
        fields: [cta("primaryCta", "First button"), cta("secondaryCta", "Second button"),
          { type: "text", key: "scrollLabel", label: "Scroll cue", help: "Desktop only." }],
      },
      {
        title: "Artwork",
        fields: [
          { type: "image", key: "imageDesktop", label: "Desktop artwork", help: "Wide landscape, about 1672 × 941. The left side sits behind the headline." },
          { type: "image", key: "image", label: "Mobile artwork", help: "Cropped to the centre-right on phones. About 1536 × 1024." },
          { type: "text", key: "imageAlt", label: "Alt text", multiline: true, help: "Describes the artwork for screen readers." },
        ],
      },
    ],
  },
  {
    id: "about",
    title: "About",
    description: "Introduction, bio and four highlights.",
    icon: "person",
    group: "sections",
    anchor: "about",
    cards: [
      {
        title: "Heading",
        fields: [
          sectionNumber,
          { type: "text", key: "marker", label: "Section label" },
          { type: "lines", key: "title", label: "Title", help: ACCENT, min: 1, max: 4 },
          { type: "text", key: "bio", label: "Bio", multiline: true },
        ],
      },
      {
        title: "Highlights",
        fields: [
          {
            type: "list",
            key: "highlights",
            label: "Highlights",
            itemName: "highlight",
            itemTitle: (h) => str(h.label) || "Untitled highlight",
            min: 1,
            max: 6,
            blank: () => ({ label: "", title: "", short: "", icon: "/images/icons/about-cap-1.svg" }),
            fields: [
              { type: "text", key: "label", label: "Label", help: "e.g. 11+ years" },
              { type: "text", key: "title", label: "Description" },
              { type: "text", key: "short", label: "Mobile description", help: MOBILE, optional: true },
              { type: "file", key: "icon", label: "Icon", accept: "image/svg+xml,image/png", kind: "icon", help: "A small SVG or PNG glyph." },
            ],
          },
        ],
      },
      { title: "Button", fields: [cta("cta", "Button")] },
      {
        title: "Artwork",
        fields: [
          { type: "image", key: "image", label: "Artwork", help: "Wide illustration, about 1774 × 887." },
          { type: "text", key: "imageAlt", label: "Alt text", multiline: true },
        ],
      },
    ],
  },
  {
    id: "journey",
    title: "Journey",
    description: "Career chapters, from the first role to today.",
    icon: "clock",
    group: "sections",
    anchor: "journey",
    cards: [
      {
        title: "Heading",
        fields: [
          { type: "text", key: "eyebrow", label: "Section label" },
          { type: "lines", key: "title", label: "Title", help: ACCENT, min: 1, max: 3 },
          { type: "text", key: "intro", label: "Introduction", multiline: true },
          { type: "text", key: "introMobile", label: "Mobile introduction", multiline: true, optional: true, help: MOBILE },
        ],
      },
      {
        title: "Chapters",
        description: "Oldest first: the scroll runs from the first chapter to the last, and the last one is labelled as the current chapter.",
        fields: [
          {
            type: "list",
            key: "chapters",
            label: "Chapters",
            itemName: "chapter",
            itemTitle: (c) => [str(c.badge), str(c.dates)].filter(Boolean).join(" · ") || "Untitled chapter",
            min: 1,
            max: 12,
            blank: () => ({
              label: "", tagline: "", dates: "", location: "", badge: "", logo: "", role: "", company: "",
              points: [{ title: "", body: "" }],
            }),
            fields: [
              { type: "text", key: "label", label: "Label", help: "Small text above the figure, e.g. The beginning." },
              { type: "text", key: "tagline", label: "Tagline", help: "Below the label, e.g. Curiosity before titles." },
              { type: "text", key: "dates", label: "Dates", help: "Below the figure, e.g. Oct 2025 – Present." },
              { type: "text", key: "location", label: "Location" },
              { type: "text", key: "role", label: "Role" },
              { type: "text", key: "company", label: "Company" },
              { type: "text", key: "badge", label: "Logo text", help: "Shown in the logo tile until a logo is added. Also the logo’s alt text." },
              { type: "image", key: "logo", label: "Logo", optional: true, help: "Optional. Fits a 116 × 94 tile." },
              {
                type: "list",
                key: "points",
                label: "What I work on",
                itemName: "point",
                itemTitle: (p) => str(p.title) || "Untitled point",
                min: 1,
                max: 3,
                blank: () => ({ title: "", body: "" }),
                fields: [
                  { type: "text", key: "title", label: "Title" },
                  { type: "text", key: "body", label: "Detail", multiline: true },
                ],
              },
            ],
          },
        ],
      },
      {
        title: "Labels",
        fields: [
          { type: "text", key: "chapterLabel", label: "Chapter counter", help: "Before the number, e.g. Chapter · 02 / 07." },
          { type: "text", key: "currentLabel", label: "Current chapter counter", help: "Used on the last chapter." },
          { type: "text", key: "workLabel", label: "Points heading" },
          { type: "text", key: "scrollHint", label: "Scroll hint", help: "At the bottom of the card while scrolling through." },
        ],
      },
      {
        title: "Artwork",
        fields: [
          { type: "image", key: "figure", label: "Figure", help: "Cut-out portrait with a transparent background, about 1024 × 1536. Stays still while the chapters change." },
          { type: "text", key: "figureAlt", label: "Figure alt text", multiline: true },
          { type: "image", key: "background", label: "Background", help: "Wide scene, about 1536 × 1024. Phones show its right side." },
        ],
      },
    ],
  },
  {
    id: "work",
    title: "Featured work",
    description: "Project cards linking to live sites.",
    icon: "briefcase",
    group: "sections",
    anchor: "work",
    cards: [
      {
        title: "Heading",
        fields: [
          sectionNumber,
          { type: "text", key: "marker", label: "Section label" },
          { type: "lines", key: "title", label: "Title", help: ACCENT, min: 1, max: 3 },
          { type: "text", key: "intro", label: "Introduction", multiline: true },
          { type: "text", key: "introMobile", label: "Mobile introduction", multiline: true, optional: true, help: MOBILE },
        ],
      },
      {
        title: "Projects",
        description: "Three or four work best. The footer lists the same projects.",
        fields: [
          {
            type: "list",
            key: "projects",
            label: "Projects",
            itemName: "project",
            itemTitle: (p) => str(p.name) || "Untitled project",
            min: 1,
            max: 6,
            blank: () => ({ name: "", title: "", stack: "", focus: "", tags: "", image: "", imageAlt: "", href: "" }),
            fields: [
              { type: "text", key: "name", label: "Brand name" },
              { type: "text", key: "title", label: "Card headline", help: "Desktop only." },
              { type: "text", key: "stack", label: "Stack", help: "Desktop only, e.g. Shopify · Liquid." },
              { type: "text", key: "focus", label: "Focus", help: "Desktop only." },
              { type: "text", key: "tags", label: "Tags", help: "Shown on phones instead of the three lines above." },
              { type: "image", key: "image", label: "Card image", help: "Near-square screenshot, about 1000 × 990." },
              { type: "text", key: "imageAlt", label: "Alt text", multiline: true },
              { type: "link", key: "href", label: "Live site", optional: true, help: "Leave empty and the card won’t be a link." },
            ],
          },
        ],
      },
      {
        title: "Button and note",
        fields: [
          cta("cta", "Button"),
          { type: "text", key: "note", label: "Closing note" },
        ],
      },
      {
        title: "Background",
        fields: [{ type: "image", key: "background", label: "Background art", help: "Decorative, sits behind the section." }],
      },
    ],
  },
  {
    id: "expertise",
    title: "Expertise",
    description: "Four capability cards.",
    icon: "star",
    group: "sections",
    anchor: "expertise",
    cards: [
      {
        title: "Heading",
        fields: [
          sectionNumber,
          { type: "text", key: "marker", label: "Section label" },
          { type: "lines", key: "title", label: "Title", help: "Two lines: the headline, then the smaller subline.", min: 1, max: 2 },
        ],
      },
      {
        title: "Cards",
        fields: [
          {
            type: "list",
            key: "cards",
            label: "Cards",
            itemName: "card",
            itemTitle: (c) => str(c.title) || "Untitled card",
            min: 1,
            max: 6,
            blank: () => ({ title: "", skills: "", skillsMobile: "", tone: "linen", emblem: "emblem-chakra", image: "", imageAlt: "" }),
            fields: [
              { type: "text", key: "title", label: "Title" },
              { type: "text", key: "skills", label: "Skills", multiline: true, help: "Separate with · (middle dot)." },
              { type: "text", key: "skillsMobile", label: "Mobile skills", multiline: true, optional: true, help: MOBILE },
              {
                type: "select",
                key: "tone",
                label: "Card colour",
                options: [
                  { label: "Linen", value: "linen" },
                  { label: "Forest", value: "forest" },
                  { label: "Sand", value: "sand" },
                ],
              },
              { type: "image", key: "emblem", label: "Emblem", help: "Small round emblem, 152 × 152." },
              { type: "image", key: "image", label: "Artwork", help: "About 1536 × 1024." },
              { type: "text", key: "imageAlt", label: "Alt text", multiline: true },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "philosophy",
    title: "Engineering philosophy",
    description: "Statement and three principles.",
    icon: "compass",
    group: "sections",
    anchor: "philosophy",
    cards: [
      {
        title: "Heading",
        fields: [
          sectionNumber,
          { type: "text", key: "marker", label: "Section label" },
          { type: "lines", key: "title", label: "Title", help: `${ACCENT} A fully highlighted line is set larger.`, min: 1, max: 3 },
          { type: "text", key: "statement", label: "Statement", multiline: true },
          { type: "text", key: "statementMobile", label: "Mobile statement", multiline: true, optional: true, help: MOBILE },
        ],
      },
      {
        title: "Principles",
        fields: [
          {
            type: "list",
            key: "principles",
            label: "Principles",
            itemName: "principle",
            itemTitle: (p) => str(p.title) || "Untitled principle",
            min: 1,
            max: 4,
            blank: () => ({ glyph: "✿", title: "", tagline: "", body: "", short: "" }),
            fields: [
              { type: "text", key: "glyph", label: "Glyph", help: "One decorative character, e.g. ✿ or ♧." },
              { type: "text", key: "title", label: "Title" },
              { type: "text", key: "tagline", label: "Tagline" },
              { type: "text", key: "body", label: "Description", multiline: true },
              { type: "text", key: "short", label: "Mobile description", multiline: true, optional: true, help: MOBILE },
            ],
          },
        ],
      },
      {
        title: "Artwork",
        fields: [{ type: "image", key: "image", label: "Artwork", help: "Decorative, beside the text on desktop." }],
      },
    ],
  },
  {
    id: "process",
    title: "Process",
    description: "Four steps from question to impact.",
    icon: "route",
    group: "sections",
    anchor: "process",
    cards: [
      {
        title: "Heading",
        fields: [
          sectionNumber,
          { type: "text", key: "marker", label: "Section label" },
          { type: "text", key: "title", label: "Title" },
        ],
      },
      {
        title: "Steps",
        fields: [
          {
            type: "list",
            key: "steps",
            label: "Steps",
            itemName: "step",
            itemTitle: (s) => str(s.title) || "Untitled step",
            min: 1,
            max: 6,
            blank: () => ({ title: "", body: "", image: "", imageAlt: "" }),
            fields: [
              { type: "text", key: "title", label: "Title" },
              { type: "text", key: "body", label: "Description", multiline: true },
              { type: "image", key: "image", label: "Artwork" },
              { type: "text", key: "imageAlt", label: "Alt text", multiline: true },
            ],
          },
        ],
      },
      { title: "Closing note", fields: [{ type: "text", key: "note", label: "Note" }] },
    ],
  },
  {
    id: "signature",
    title: "Heritage signature",
    description: "Full-width statement over artwork.",
    icon: "feather",
    group: "sections",
    anchor: "signature",
    cards: [
      {
        title: "Text",
        fields: [
          { type: "lines", key: "eyebrow", label: "Eyebrow", help: "One line per row.", min: 1, max: 3 },
          { type: "lines", key: "title", label: "Title", help: ACCENT, min: 1, max: 3 },
          { type: "text", key: "body", label: "Body", multiline: true },
          { type: "text", key: "bodyMobile", label: "Mobile body", multiline: true, optional: true, help: MOBILE },
        ],
      },
      {
        title: "Artwork",
        fields: [{ type: "image", key: "image", label: "Artwork", help: "Wide panorama, about 1920 × 640. Desktop only." }],
      },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    description: "The namaste invitation and contact buttons.",
    icon: "mail",
    group: "sections",
    anchor: "contact",
    cards: [
      {
        title: "Heading",
        fields: [
          sectionNumber,
          { type: "text", key: "marker", label: "Section label" },
          { type: "text", key: "markerMobile", label: "Mobile section label", optional: true, help: MOBILE },
          { type: "text", key: "title", label: "Title" },
          { type: "text", key: "subtitle", label: "Subtitle", help: "Desktop only." },
          { type: "text", key: "titleMobile", label: "Mobile title", optional: true, help: "Phones show this instead of the title and subtitle." },
        ],
      },
      {
        title: "Text and buttons",
        description: "The buttons use the email address and résumé from Settings.",
        fields: [
          { type: "text", key: "copy", label: "Invitation", multiline: true },
          { type: "text", key: "copyMobile", label: "Mobile invitation", multiline: true, optional: true, help: MOBILE },
          { type: "text", key: "emailLabel", label: "Email button" },
          { type: "text", key: "emailLabelMobile", label: "Mobile email button", optional: true, help: MOBILE },
          { type: "text", key: "resumeLabel", label: "Résumé button" },
          { type: "text", key: "signoff", label: "Sign-off" },
          { type: "text", key: "namaste", label: "Closing word" },
        ],
      },
      {
        title: "Video",
        fields: [
          { type: "file", key: "video", label: "Video", accept: "video/webm,video/mp4", kind: "video", help: "Short silent loop, 16:9. WebM or MP4, ideally under 3 MB." },
          { type: "file", key: "videoPoster", label: "Poster image", accept: "image/webp,image/jpeg,image/png", kind: "image", help: "Shown before the video plays. Use its first frame." },
          { type: "text", key: "videoLabel", label: "Description", multiline: true, help: "Describes the video for screen readers." },
        ],
      },
    ],
  },
  {
    id: "footer",
    title: "Footer",
    description: "Colophon, link columns and closing quote.",
    icon: "footer",
    group: "sections",
    anchor: "footer",
    cards: [
      {
        title: "Brand",
        description: "Social links and email come from Settings.",
        fields: [
          { type: "text", key: "role", label: "Role line" },
          { type: "text", key: "tagline", label: "Tagline", multiline: true },
        ],
      },
      {
        title: "Link columns",
        description: "Navigation repeats the header menu (Settings). Featured work lists the projects.",
        fields: [
          { type: "text", key: "navigationHeading", label: "Navigation heading" },
          { type: "text", key: "homeLabel", label: "Home link label" },
          { type: "text", key: "workHeading", label: "Featured work heading" },
          { type: "text", key: "viewAllLabel", label: "“View all” link label", help: "Desktop only." },
          { type: "link", key: "viewAllHref", label: "“View all” link" },
          { type: "text", key: "resourcesHeading", label: "Resources heading" },
          {
            type: "list",
            key: "resources",
            label: "Resources",
            itemName: "link",
            itemTitle: (r) => str(r.label) || "Untitled link",
            min: 1,
            max: 8,
            blank: () => ({ label: "", href: "" }),
            fields: [
              { type: "text", key: "label", label: "Label" },
              { type: "link", key: "href", label: "Link" },
            ],
          },
        ],
      },
      {
        title: "Closing",
        fields: [
          { type: "text", key: "quote", label: "Quote", multiline: true },
          { type: "text", key: "copyright", label: "Copyright" },
          { type: "text", key: "credit", label: "Credit line" },
        ],
      },
    ],
  },
  {
    id: "clients",
    title: "All projects",
    description: "Every brand you’ve built for, by market.",
    icon: "list",
    group: "content",
    cards: [
      {
        title: "Clients by market",
        description: "Not shown on the site yet. The upcoming all-projects page will list these.",
        fields: [
          {
            type: "list",
            key: "groups",
            label: "Markets",
            itemName: "market",
            itemTitle: (g) => str(g.region) || "Untitled market",
            blank: () => ({ region: "", clients: [] }),
            fields: [
              { type: "text", key: "region", label: "Market", help: "e.g. India, UK & Europe" },
              {
                type: "list",
                key: "clients",
                label: "Clients",
                itemName: "client",
                itemTitle: (c) => str(c.name) || "Untitled client",
                blank: () => ({ name: "", sites: [{ label: "", href: "" }] }),
                fields: [
                  { type: "text", key: "name", label: "Brand name" },
                  {
                    type: "list",
                    key: "sites",
                    label: "Stores",
                    itemName: "store",
                    itemTitle: (s) => str(s.label) || str(s.href).replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") || "URL to come",
                    min: 1,
                    blank: () => ({ label: "", href: "" }),
                    fields: [
                      { type: "text", key: "label", label: "Region label", optional: true, help: "Only for brands with several stores, e.g. UK." },
                      { type: "link", key: "href", label: "URL", optional: true, help: "Leave empty until the URL is confirmed." },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "site",
    title: "Settings",
    description: "Name, contact details, résumé, menu and search listing.",
    icon: "settings",
    group: "settings",
    cards: [
      {
        title: "Identity",
        fields: [
          { type: "text", key: "name", label: "Name", help: "Used in the logo, footer and share previews." },
          { type: "text", key: "role", label: "Role" },
        ],
      },
      {
        title: "Contact and social",
        description: "Every email button, social icon and résumé link on the site uses these.",
        fields: [
          { type: "text", key: "email", label: "Email address" },
          { type: "text", key: "emailSubject", label: "Email subject", help: "Pre-filled when someone clicks an email link." },
          { type: "link", key: "linkedin", label: "LinkedIn profile" },
          { type: "link", key: "github", label: "GitHub profile" },
          { type: "file", key: "resume", label: "Résumé", accept: "application/pdf", kind: "PDF" },
          { type: "text", key: "resumeDownloadName", label: "Résumé download name", help: "File name visitors save it as, e.g. Rohit-Mishra-Resume.pdf." },
        ],
      },
      {
        title: "Menu",
        description: "Header links. The footer’s navigation column repeats them.",
        fields: [
          {
            type: "list",
            key: "nav",
            label: "Menu items",
            itemName: "menu item",
            itemTitle: (n) => str(n.label) || "Untitled item",
            min: 1,
            max: 7,
            blank: () => ({ label: "", href: "#" }),
            fields: [
              { type: "text", key: "label", label: "Label" },
              { type: "link", key: "href", label: "Link" },
            ],
          },
        ],
      },
      {
        title: "Search engine and share preview",
        description: "How the site appears in Google results and when shared on WhatsApp, LinkedIn or X.",
        fields: [
          { type: "text", key: "seoTitle", label: "Page title" },
          { type: "text", key: "seoDescription", label: "Meta description", multiline: true },
          { type: "file", key: "shareImage", label: "Share image", accept: "image/jpeg,image/png", kind: "image", help: "Exactly 1200 × 630, JPEG or PNG." },
          { type: "text", key: "shareImageAlt", label: "Share image alt text" },
        ],
      },
    ],
  },
];

export const sectionById = (id: string) => sections.find((s) => s.id === id);

/** Anchors the link picker offers, in page order. */
export const pageAnchors = [
  { label: "Top of page", value: "#top" },
  ...sections.filter((s) => s.anchor && s.anchor !== "top").map((s) => ({ label: s.title, value: `#${s.anchor}` })),
];
