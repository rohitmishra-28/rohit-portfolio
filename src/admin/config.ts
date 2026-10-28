import { basePath } from "@/lib/base-path";

// Where the CMS reads and writes content. The deploy workflow passes the
// repository it builds from; locally it falls back to the live repository.
const [owner, repo] = (process.env.NEXT_PUBLIC_CMS_REPO || "rohitmishra-28/rohit-portfolio").split("/");

export const cmsConfig = {
  owner,
  repo,
  branch: "main",
  /** The deploy workflow file, for publish status. */
  workflow: "deploy-pages.yml",
  /** Public site, for "View site" links. */
  siteUrl: `${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || basePath}/`,
  contentDir: "content",
  /** Source images (design exports, then CMS uploads). */
  imageDirs: ["src/assets/figma", "src/assets/uploads"],
  uploadImageDir: "src/assets/uploads",
  /** Built image variants, removed with their source. */
  builtImageDir: "public/images",
  /** Files served as-is from /public (résumé, video, icons…). */
  publicDir: "public",
  uploadFileDir: "public/uploads",
} as const;

export const repoUrl = `https://github.com/${owner}/${repo}`;
