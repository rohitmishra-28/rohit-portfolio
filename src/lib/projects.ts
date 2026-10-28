import type { ImageName } from "./images.generated";

// Featured projects: the three chosen by Rohit, with card images captured
// from each live store. Shaped so a CMS can populate it later.

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
    slug: "grand-seiko",
    name: "Grand Seiko",
    title: "Luxury, made online",
    stack: "Shopify · Liquid · Theme development",
    focus: "Luxury boutique experience",
    tags: "Luxury · Shopify",
    image: "project-grand-seiko",
    imageAlt: "Grand Seiko India online boutique homepage, featuring two silver Heritage Collection watches.",
    href: "https://grandseikoboutique.in/",
  },
  {
    slug: "seiko",
    name: "Seiko Watches",
    title: "Craft, made reliable",
    stack: "Shopify · Liquid · Theme development",
    focus: "Brand storefront",
    tags: "Watches · Shopify",
    image: "project-seiko",
    imageAlt: "Seiko India online store homepage, featuring a Prospex India Limited Edition dive watch with a tiger.",
    href: "https://seikowatches.co.in/",
  },
  {
    slug: "vishal-mega-mart",
    name: "Vishal Mega Mart",
    title: "Retail at national scale",
    stack: "Salesforce Commerce Cloud · Frontend development",
    focus: "High-traffic grocery & apparel commerce",
    tags: "Retail · Commerce Cloud",
    image: "project-vishal-mega-mart",
    imageAlt: "Vishal Mega Mart online store homepage, with clothing, home and grocery categories and a festive gifts banner.",
    href: "https://www.vishalmegamart.com/",
  },
];

// Every brand Rohit has built for, by market (listed by the user; URLs are
// the live stores, checked by hand). A site with several regional stores
// lists each one. href null = URL still to come. Not rendered yet: kept for
// the upcoming all-projects page.

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
