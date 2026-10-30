import type { Metadata } from "next";
import { manrope, yatraOne } from "@/lib/fonts";
import "../../../globals.css";

export const metadata: Metadata = {
  title: "Preview · Admin",
  robots: { index: false, follow: false },
};

// The CMS live preview: the site's fonts and styles without its chrome
// scripts. data-cms-preview turns the section animations off.
export default function PreviewLayout({ children }: LayoutProps<"/admin/preview">) {
  return (
    <html lang="en" className={`${yatraOne.variable} ${manrope.variable}`} data-cms-preview="">
      <body>{children}</body>
    </html>
  );
}
