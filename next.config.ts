import type { NextConfig } from "next";

// Sub-path the site is served from, e.g. "/rohit-portfolio" on GitHub Pages
// (set by the deploy workflow). Empty for a root domain.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Fully static site: `next build` writes HTML/CSS/JS to `out/`.
  output: "export",
  basePath,
  // `npm run dev:remote` serves the dev server through a temporary
  // Cloudflare quick tunnel (random *.trycloudflare.com address); Next
  // otherwise blocks dev assets requested from another hostname.
  allowedDevOrigins: ["*.trycloudflare.com"],
  images: {
    // No image server in a static export. Responsive AVIF/WebP variants are
    // generated ahead of time and served from public/images.
    unoptimized: true,
  },
};

export default nextConfig;
