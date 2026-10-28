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
  // Verified live site (case-study pages later). null = card is non-clickable.
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
    href: "https://www.tarinika.com/",
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
    href: "https://paksha.com/",
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
    href: "https://www.novology.com/",
  },
];

// Every brand Rohit has built for, by market (listed by the user; URLs are
// the live stores, checked by hand). A site with several regional stores
// lists each one. href null = URL still to come; shown as plain text.

export type ClientSite = { label: string; href: string | null };
export type Client = { name: string; sites: ClientSite[] };
export type ClientGroup = { region: string; clients: Client[] };

const site = (href: string | null): ClientSite[] => [{ label: "", href }];

export const clientGroups: ClientGroup[] = [
  {
    region: "India",
    clients: [
      { name: "Seiko Watches", sites: site("https://seikowatches.co.in/") },
      { name: "Grand Seiko", sites: site("https://grandseikoboutique.in/") },
      { name: "TrueSouth Coffee", sites: site("https://truesouth.in/") },
      { name: "Novology", sites: site("https://www.novology.com/") },
      { name: "Vishal Mega Mart", sites: site("https://www.vishalmegamart.com/") },
      { name: "Infinitea", sites: site(null) },
      { name: "Alba Watches", sites: site(null) },
      { name: "Adelite", sites: site(null) },
    ],
  },
  {
    region: "UK & Europe",
    clients: [
      { name: "Hush Puppies", sites: site("https://www.hushpuppies.co.uk/") },
      {
        name: "Muck Boot",
        sites: [
          { label: "UK", href: "https://muckbootcompany.co.uk/" },
          { label: "EU", href: "https://muckbootcompany.eu/" },
          { label: "DE", href: "https://muckbootcompany.de/" },
        ],
      },
      { name: "CAT Footwear", sites: site("https://catfootwear.co.uk/") },
      { name: "Base London", sites: site("https://baselondon.com/") },
      { name: "Timberland PRO", sites: site("https://timberlandpro.co.uk/") },
      { name: "Frye", sites: site("https://fryeboots.co.uk/") },
      { name: "Bearpaw", sites: site("https://bearpawshoes.co.uk/") },
      { name: "Brantano", sites: site("https://www.brantano.co.uk/") },
    ],
  },
];
