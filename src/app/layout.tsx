import type { Metadata, Viewport } from "next";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${yatraOne.variable} ${manrope.variable}`}>
      <body>
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
