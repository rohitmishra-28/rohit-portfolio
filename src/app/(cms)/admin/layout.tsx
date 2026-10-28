import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AdminApp } from "@/admin/AdminApp";
import "@/admin/admin.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Admin · Rohit Mishra",
  robots: { index: false, follow: false },
};

// The CMS: a client-side app that edits /content through the GitHub API.
// Its own root layout, so none of the site's chrome or styles load here.
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AdminApp>{children}</AdminApp>
      </body>
    </html>
  );
}
