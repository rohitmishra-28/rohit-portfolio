// The site can be served from a sub-path (GitHub Pages serves it at
// /rohit-portfolio). Next adds that prefix to its own links and bundles, but
// not to plain paths into public/, so those go through `asset()`.
// Set at build time via NEXT_PUBLIC_BASE_PATH; empty when served from a root.
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const asset = (path: string) => `${basePath}${path}`;
