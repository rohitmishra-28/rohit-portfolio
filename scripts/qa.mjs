// Responsive QA pass: full-page screenshots plus overflow, image, link and
// console checks at each target width.
// Usage: node scripts/qa.mjs [baseUrl] [outDir]
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.argv[2] ?? "http://localhost:3000";
const outDir = path.resolve(process.argv[3] ?? "qa-output");
const widths = [1440, 1280, 1024, 768, 430, 390, 360];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
let failures = 0;

for (const reducedMotion of ["no-preference", "reduce"]) {
  for (const width of reducedMotion === "reduce" ? [390] : widths) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion,
    });
    const problems = [];
    page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text()}`));
    page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
    page.on("requestfailed", (r) => problems.push(`request failed: ${r.url()}`));
    page.on("response", (r) => r.status() >= 400 && problems.push(`HTTP ${r.status()}: ${r.url()}`));

    await page.goto(baseUrl, { waitUntil: "networkidle" });

    // Scroll through so observers fire and lazy images load.
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 400) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(120);
    }
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1200);

    const report = await page.evaluate(() => {
      const doc = document.documentElement;
      // Cards off to the side of a horizontal scroller reveal when scrolled to.
      const hidden = [...document.querySelectorAll("[data-reveal]")].filter((el) => {
        const r = el.getBoundingClientRect();
        const offside = r.left >= doc.clientWidth || r.right <= 0;
        return r.width && !offside && Number(getComputedStyle(el).opacity) < 0.99;
      });
      const brokenImgs = [...document.images].filter(
        (img) => img.getClientRects().length && img.complete && img.naturalWidth === 0,
      );
      const badLinks = [...document.querySelectorAll("a")].filter((a) => {
        const href = a.getAttribute("href");
        return !href || href === "#";
      });
      const anchors = [...document.querySelectorAll('a[href^="#"]')]
        .map((a) => a.getAttribute("href"))
        .filter((h) => !document.getElementById(h.slice(1)));
      const wide = [...document.querySelectorAll("body *")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width && (r.right > doc.clientWidth + 1 || r.left < -1);
        })
        .filter((el) => !el.closest("[class*='cards']"))
        .slice(0, 5)
        .map((el) => `${el.tagName.toLowerCase()}.${el.className}`);
      return {
        overflowX: doc.scrollWidth > doc.clientWidth,
        hidden: hidden.length,
        brokenImgs: brokenImgs.map((i) => i.currentSrc),
        badLinks: badLinks.length,
        missingAnchors: anchors,
        wide,
        h1: document.querySelectorAll("h1").length,
      };
    });

    if (report.overflowX) problems.push(`horizontal overflow: ${report.wide.join(", ")}`);
    if (report.hidden) problems.push(`${report.hidden} reveal items still hidden`);
    if (report.brokenImgs.length) problems.push(`broken images: ${report.brokenImgs.join(", ")}`);
    if (report.badLinks) problems.push(`${report.badLinks} links with empty or "#" href`);
    if (report.missingAnchors.length) problems.push(`missing anchors: ${report.missingAnchors}`);
    if (report.h1 !== 1) problems.push(`${report.h1} h1 elements`);

    const name = `${width}${reducedMotion === "reduce" ? "-reduced" : ""}`;
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: true });
    console.log(`${name}: ${problems.length ? problems.join(" | ") : "ok"}`);
    failures += problems.length;
    await page.close();
  }
}

await browser.close();
process.exitCode = failures ? 1 : 0;
