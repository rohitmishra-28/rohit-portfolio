# Rohit Mishra — Creative Portfolio

A creative, minimal, editorial-style portfolio showcasing my work in e-commerce engineering, frontend development, performance optimisation, and conversion-focused experiences.

The portfolio blends modern digital design with subtle Indian heritage-inspired visual storytelling.

## Project Goals

- Create a distinctive, premium personal portfolio.
- Showcase selected e-commerce projects and technical expertise.
- Communicate both creative thinking and engineering depth.
- Use refined typography, illustrations, and subtle scroll-driven animations.
- Deliver an accessible, responsive, and performant experience.
- Make the website production-ready and easy to maintain.

## Design Reference

**Primary inspiration:** [Kigo Studio](https://kigo.studio/)

**Design source:** [Rohit Mishra — Creative Portfolio System in Figma](https://www.figma.com/design/ePn9gf6hogHc0y5zP1sdV8/Rohit-Mishra-%E2%80%94-Creative-Portfolio-System?node-id=11-45)

Use the approved Figma designs as the visual source of truth. Do not redesign approved sections without permission.

## Design Direction

- **Style:** Creative, minimal, editorial, premium.
- **Visual influence:** Indian heritage-inspired illustration and contemporary digital craftsmanship.
- **Palette:** Parchment, warm ivory, forest green, terracotta, muted gold, and charcoal.
- **Display typeface:** Yatra One.
- **Body typeface:** Manrope.
- **Motion:** Purposeful, smooth, section-specific animations.
- **Layout:** Spacious compositions, strong typography, and responsive project cards.

## Website Sections

1. Hero
2. About
3. Journey (pinned career timeline)
4. Featured Work
5. Expertise
6. Engineering Philosophy
7. Process
8. Heritage to Digital
9. Contact
10. Footer

## Technical Scope

The implementation should include:

- Responsive desktop, tablet, and mobile layouts.
- Reusable components and maintainable styles.
- Individual scroll animations for each section.
- Accessible navigation and interactive elements.
- Reduced-motion support.
- Optimised images, fonts, and assets.
- SEO metadata and semantic HTML.
- Performance-conscious implementation.
- Verified project, social, email, and résumé links.

## Folder Structure

```text
rohit-portfolio/
├── content/              # All site text, links and image choices, one JSON file per section (edited by the CMS)
├── public/               # Files served as-is: built image variants, résumé, video, icons, uploads/
├── scripts/              # Image pipeline and QA
├── src/
│   ├── admin/            # The CMS: schema, GitHub client, state, Shopify-style UI
│   ├── app/
│   │   ├── (site)/       # The portfolio homepage
│   │   ├── (cms)/admin/  # The CMS at /admin
│   │   └── (preview)/    # The CMS live preview at /admin/preview
│   ├── assets/           # Source images: figma/ (design exports) and uploads/ (from the CMS)
│   ├── content/          # Content types, loader and link helpers
│   ├── components/
│   ├── sections/
│   ├── animations/
│   └── lib/
├── CLAUDE_CODE_HANDOFF_ROHIT_PORTFOLIO.md
├── README.md
└── package.json
```

## Content Management (CMS)

Every image, piece of text and link on the site can be changed section by section at **`/admin`** (on GitHub Pages: `https://rohitmishra-28.github.io/rohit-portfolio/admin`). The admin is styled after the Shopify admin.

**How it works.** The site's content lives in `content/*.json` in this repository. The admin reads and writes those files through the GitHub API, so there's no server or database to run. Saving makes one commit; the existing deploy workflow rebuilds the site and it's live in about 2–3 minutes. Every save is in the Git history and can be reverted.

**Logging in.** The admin asks for a fine-grained GitHub token, which only you can create:

1. Go to GitHub › Settings › Developer settings › Fine-grained tokens › Generate new token.
2. Under *Repository access* choose *Only select repositories* › `rohit-portfolio`.
3. Under *Repository permissions*, set *Contents* to **Read and write** and *Actions* to **Read-only** (Actions only shows publish progress).
4. Paste the token into the login page. It stays in your browser and is only sent to GitHub.

**What you can do.**

- Edit every section: headings, body copy, mobile-specific wording, buttons and their links, alt text.
- Highlight words in titles with `*asterisks*` to set them in the accent colour.
- Add, remove and reorder list items: projects, highlights, cards, principles, steps, menu items, footer links.
- Pick images from the media library or upload new ones (PNG, JPG, WebP). On deploy they're converted to responsive AVIF/WebP automatically.
- Replace files: résumé PDF, contact video and poster, highlight icons, share image.
- See a live preview of the real page at desktop and phone sizes before saving.
- Edit site settings: name, email, LinkedIn, GitHub, résumé, header menu, and SEO and share-preview text.

Safeguards: required fields and link formats are checked before saving, and a save is refused if someone else changed the same section on GitHub meanwhile. Images in use can't be deleted, and the build fails with a clear message if content names an image that doesn't exist.

**Editing without the admin.** You can also edit `content/*.json` directly and push. For images, add the file to `src/assets/uploads/` and use its file name, without the extension, as the image value. `npm run dev` and `npm run build` generate image variants automatically, or run `npm run images` yourself.

## Search and custom domain

- **Search basics** come from CMS › Settings: page title, meta description, share image, and the *Structured data* card (full name, other names, summary, employer, location, skills). The homepage emits Person, WebSite and ProfilePage JSON-LD from them; the build writes `sitemap.xml` and `robots.txt`.
- **Custom domain:** in the repository, add the Actions variable `CUSTOM_DOMAIN` (Settings › Secrets and variables › Actions › Variables), e.g. `rohitkumarmishra.com`, and set the same domain under Settings › Pages, with *Enforce HTTPS*. At your registrar, point the apex at GitHub Pages (A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`) and `www` (CNAME) at `rohitmishra-28.github.io`. Re-run the deploy: the site then builds for the domain root, and canonical, share, sitemap and structured-data URLs all use the new domain. The CMS keeps working at `/admin`.
- **Search Console:** add a *Domain* property for the new domain, verify it with the DNS TXT record Google gives you, and submit `https://<domain>/sitemap.xml`.

## Important Rules

1. Read `CLAUDE_CODE_HANDOFF_ROHIT_PORTFOLIO.md` before implementation.
2. Inspect the existing project before changing files.
3. Preserve approved designs and established design tokens.
4. Do not invent project achievements, performance metrics, client details, or credentials.
5. Do not invent email addresses, résumé links, social profiles, or project URLs.
6. Do not present React as an existing professional skill or claim expertise that has not been established.
7. Prefer accessible, performant solutions over unnecessary dependencies.
8. Ask for approval before making major design changes or destructive modifications.
9. Verify responsive behaviour and reduced-motion support before launch.

## Current Status

**Phase:** Live on GitHub Pages (Next.js static export), with content managed through the CMS at `/admin`.

**Next milestones:** All-projects page (its content is already editable under *All projects* in the CMS), case-study pages, custom domain.

---

Built with care by Rohit Mishra.
