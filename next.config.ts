import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site: `next build` writes HTML/CSS/JS to `out/`.
  output: "export",
  images: {
    // No image server in a static export. Responsive AVIF/WebP variants are
    // generated ahead of time and served from public/images.
    unoptimized: true,
  },
};

export default nextConfig;
