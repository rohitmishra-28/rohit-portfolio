import { asset } from "@/lib/base-path";
import type { Metadata, Viewport } from "next";
import { MotionRoot } from "@/components/MotionRoot";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { content, siteUrl } from "@/content";
import { manrope, yatraOne } from "@/lib/fonts";
import "../globals.css";

const { site } = content;
const title = site.seoTitle;

// Share card: the homepage banner (site settings, 1200×630). Link
// previews (WhatsApp, LinkedIn, X…) need absolute URLs, so the card and
// canonical are only emitted when the site URL is known. URLs are built in
// full because the site may live under a sub-path.
const shareImage = siteUrl && {
  url: `${siteUrl}${site.shareImage}`,
  width: 1200,
  height: 630,
  alt: site.shareImageAlt,
};

export const metadata: Metadata = {
  ...(siteUrl && { metadataBase: new URL(siteUrl) }),
  title,
  description: site.seoDescription,
  ...(siteUrl && { alternates: { canonical: `${siteUrl}/` } }),
  openGraph: {
    type: "website",
    siteName: site.name,
    title,
    description: site.seoDescription,
    ...(siteUrl && { url: `${siteUrl}/` }),
    ...(shareImage && { images: [shareImage] }),
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: site.seoDescription,
    ...(shareImage && { images: [shareImage.url] }),
  },
  // Brand icons from the Figma logo system (171:2). favicon.ico (16/32/48,
  // dark tile) comes from src/app/favicon.ico via the file convention.
  icons: {
    icon: [{ url: asset("/icons/favicon-32.png"), sizes: "32x32", type: "image/png" }],
    apple: [{ url: asset("/icons/apple-touch-icon.png"), sizes: "180x180" }],
  },
  manifest: asset("/site.webmanifest"),
};

export const viewport: Viewport = {
  themeColor: "#f5ebdd",
};

// Runs before first paint: hands scroll restoration to MotionRoot (pinned
// sections change the page height after load), and lets CSS pre-hide the
// hero copy for its GSAP entrance, with a 3s escape hatch.
const motionBootstrap = `(function(){var d=document.documentElement;if("scrollRestoration" in history)history.scrollRestoration="manual";if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;d.classList.add("js-motion");setTimeout(function(){if(!d.classList.contains("hero-anim"))d.classList.add("anim-failed")},3000)})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the bootstrap script adds classes to <html>.
    <html lang="en" className={`${yatraOne.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionBootstrap }} />
      </head>
      <body>
        <MotionRoot />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteHeader name={site.name} nav={site.nav} />
        <main id="main">{children}</main>
        <SiteFooter content={content.footer} site={site} projects={content.work.projects} />
      </body>
    </html>
  );
}
