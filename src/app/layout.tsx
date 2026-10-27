import type { Metadata, Viewport } from "next";
import { MotionRoot } from "@/components/MotionRoot";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { manrope, yatraOne } from "@/lib/fonts";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

// Description and social preview copy are finalised with the Hero content.
export const metadata: Metadata = {
  ...(siteConfig.url && { metadataBase: new URL(siteConfig.url) }),
  title: siteConfig.name,
  ...(siteConfig.url && { alternates: { canonical: "/" } }),
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
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
