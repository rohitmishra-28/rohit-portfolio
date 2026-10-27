# Claude Code Handoff — Rohit Mishra Portfolio

**Goal:** Ship a faithful, responsive, launch-ready portfolio as a birthday gift.
**Figma source:** https://www.figma.com/design/ePn9gf6hogHc0y5zP1sdV8/Rohit-Mishra-%E2%80%94-Creative-Portfolio-System?node-id=11-45
**Design system:** https://www.figma.com/design/ePn9gf6hogHc0y5zP1sdV8/Rohit-Mishra-%E2%80%94-Creative-Portfolio-System?node-id=11-234
**Link strategy frame:** https://www.figma.com/design/ePn9gf6hogHc0y5zP1sdV8/Rohit-Mishra-%E2%80%94-Creative-Portfolio-System?node-id=160-2
Desktop frame `11:45`; mobile frame `114:2`.

## 1. Mission and rules

The Figma desktop and mobile frames are the visual source of truth. Inspect them before coding. Keep the Indian heritage illustration direction, parchment/forest/terracotta palette, approved content, project names, and section order. Do not invent URLs, testimonials, metrics, case studies, credentials, or biography claims. Preserve the approved footer structure. Where mobile and desktop differ, implement the corresponding frame rather than forcing one layout everywhere.

Do not call the site launch-ready until real links/assets are configured, responsive and accessibility checks pass, and a production build succeeds.

## 2. Recommended implementation

Inspect the repository first and keep its existing framework/package manager if it is working. If starting fresh, use Next.js App Router + TypeScript, semantic HTML, CSS custom properties, responsive optimized images, and lightweight CSS/IntersectionObserver reveals. Use GSAP only if necessary for the exact scroll-linked background movement. Avoid adding a heavy animation library just for fades.

Suggested structure:
```text
app/layout.tsx
app/page.tsx
app/globals.css
components/SiteHeader.tsx
components/SiteFooter.tsx
components/SectionReveal.tsx
components/ProjectCard.tsx
sections/HeroSection.tsx
sections/AboutSection.tsx
sections/FeaturedWorkSection.tsx
sections/ExpertiseSection.tsx
sections/EngineeringPhilosophySection.tsx
sections/ProcessSection.tsx
sections/HeritageSignatureSection.tsx
sections/ContactSection.tsx
lib/site-config.ts
public/images/
```

## 3. Design tokens from Figma design-system frame

```css
:root {
  --color-parchment: #F5EBDD;
  --color-warm-ivory: #FBF6ED;
  --color-ink: #1E211B;
  --color-forest: #18291F;
  --color-deep-green: #102019;
  --color-terracotta: #C65B32;
  --color-burnt-sienna: #A94627;
  --color-muted-ochre: #C6A15B;
  --color-stone: #807B70;
  --color-soft-sage: #A9B39A;
  --color-border-light: #DCD0BC;
  --color-border-dark: #405044;

  --font-display: "Yatra One", Georgia, serif;
  --font-sans: "Manrope", Arial, sans-serif;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
  --space-32: 128px;
  --space-40: 160px;

  --ease-out: cubic-bezier(.22, 1, .36, 1);
  --duration-fast: 180ms;
  --duration-base: 240ms;
  --duration-reveal: 420ms;
}
```

**Type rules**
- Yatra One Regular: display headlines only.
- Manrope Regular: body and descriptions.
- Manrope Medium: eyebrows, navigation and metadata.
- Manrope Bold: section headings, project names and capability titles.
- Use font loading with `display=swap` or self-hosted font files. Keep fallbacks.
- Use the actual Figma type scale as reference; do not globally enlarge or shrink every heading.
- At 390px, manually verify line breaks and text box heights. Never solve wrapping by making body text uncomfortably small.

**Grid/spacing rules**
- Desktop 1440: 12 columns, ~72px outer gutter.
- Tablet 768: 8 columns, ~32px gutter.
- Mobile 390: 4 columns, ~20–24px gutter.
- Use bounded content widths and section-specific vertical rhythm.
- Avoid horizontal overflow, distorted images, text clipping, and accidental overlaps.
- Preserve intended card overlap only where shown; mobile card content must remain readable without animation.
- Use `object-position` to match image crops.

## 4. Section structure and anchors

| Order | Section | ID |
|---|---|---|
| 01 | Hero | `top` |
| 02 | About | `about` |
| 03 | Featured Work | `work` |
| 04 | Expertise | `expertise` |
| 05 | Engineering Philosophy | `philosophy` |
| 06 | Process | `process` |
| 07 | Heritage to Digital Signature | `signature` |
| 08 | Contact | `contact` |
| 09 | Footer | `footer` |

Keep each section as its own component. Use the content and imagery already in Figma. Expertise cards should cover Ecommerce Engineering, Frontend Craft, Performance & Quality, and Growth & Experience. Process should remain Understand → Explore → Build → Refine.

## 5. Scroll animation spec — implement each section independently

Use a shared `SectionReveal` utility with section-level variants/staggers. `IntersectionObserver` threshold around `0.12–0.2` is sufficient. Reveal once by default. Animate `opacity` and `transform`, not layout dimensions. Content must remain visible if JavaScript fails. Add motion classes only after observer initialization. No scroll hijacking. Honour `prefers-reduced-motion: reduce` by disabling transforms/parallax and keeping all content visible.

### Hero
- On first render: headline lines reveal with 60–90ms stagger, opacity 0→1 and translateY 12px→0 over 420–520ms.
- Eyebrow/supporting copy follow with a small delay; CTAs appear together.
- Optional desktop-only background drift/parallax: maximum 8–12px. Disable on mobile and reduced motion.
- Do not delay hero content until an observer fires. Avoid layout shift while fonts/images load.

### About
- Eyebrow/headline reveal upward 12px over ~420ms.
- Illustration fades/rises subtly over ~500ms.
- Bio follows the headline; fact/capability items stagger by ~70ms.
- Do not animate/count up values unless they are verified and the design explicitly calls for it.

### Featured Work
- Heading and intro reveal as a group.
- Desktop project cards stagger by ~90ms, rise 18px, opacity 0→1 over ~420ms.
- Hover: card translateY(-4px), image scale 1.02, ~180ms.
- Mobile cards reveal as they enter view. Keep every card reachable and readable in a static fallback.
- Only make a card clickable when a verified destination exists.

### Expertise
- Heading/subhead reveal first.
- Each of four capability cards reveals independently with 80–100ms stagger.
- Desktop layered cards: animate opacity and 10–14px translateY only; do not animate height/reflow.
- Mobile cards remain separate, non-overlapping panels.
- Artwork can fade in ~100ms after its card content.

### Engineering Philosophy
- Keep the dark section background stable.
- Statement lines reveal with ~70ms stagger over 420–480ms.
- Performance, Accessibility and Maintainability principles reveal individually.
- Optional desktop background-only parallax up to 8px; disable on touch/reduced motion.

### Process
- Heading/intro reveal first.
- Understand → Explore → Build → Refine cards reveal with ~80ms stagger over 360–420ms.
- Optional connector line scaleX animation on desktop; provide a static fallback.
- Mobile steps are vertically stacked; no horizontal connector animation.

### Heritage to Digital Signature
- Calm image crossfade ~500ms and headline rise of 10px over ~420ms.
- Avoid multiple parallax layers and any artificial interstitial/loading screen.

### Contact
- Eyebrow/headline reveal as one group.
- Supporting copy and CTA group follow after ~80ms.
- No pulsing/flashing CTA. Email/download actions must only happen on user activation.

### Footer
- Simple fade-in once visible, ~300–380ms.
- Avoid staggering every footer link. Preserve existing layout.
- Footer remains usable with animation disabled or JS unavailable.

Suggested progressive-enhancement CSS:
```css
.reveal { opacity: 1; transform: none; }
.motion-ready .reveal {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity var(--duration-reveal) var(--ease-out),
              transform var(--duration-reveal) var(--ease-out);
}
.motion-ready .reveal.is-visible { opacity: 1; transform: translateY(0); }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .motion-ready .reveal,
  .motion-ready .reveal.is-visible {
    opacity: 1; transform: none; transition: none;
  }
}
```
Use `IntersectionObserver` to add `.is-visible`, then `unobserve()` one-time reveals. If observer is unavailable, keep content visible. Respect reduced motion for smooth anchor scrolling too.

## 6. Link strategy and “Namaste”

Use the separate Figma frame **02 — Link strategy & micro-interactions** as the interaction reference.

- “Namaste, and welcome.” is an optional warm hero detail, not a blocking splash screen, mandatory click, forced delay or audio.
- Greeting can fade in over ~240ms.
- Wordmark → `#top`
- Work → `#work`
- About → `#about`
- Expertise → `#expertise`
- Process → `#process`
- Contact → `#contact` or a verified `mailto:` address
- Résumé → final checked PDF only, e.g. `/resume.pdf` after the file exists
- LinkedIn/GitHub → verified profile URLs only
- Tarinika/Paksha/Novology → verified live project or case-study URLs only
- Footer destinations must match the header.

Centralize destinations in `lib/site-config.ts`. Do not invent an email or URLs. No empty hrefs or `href="#"`. Use a real anchor, real URL, or non-link element.

**States**
- Hover: 150–220ms subtle color/underline/lift.
- Focus-visible: 2px high-contrast outline with 3px offset. Never remove focus styling without replacement.
- Pressed: immediate subtle color/1px feedback.
- Touch targets: aim for 44×44px.
- External link icons are decorative (`aria-hidden="true"`); the text label must be meaningful alone. If opening a new tab, use `rel="noreferrer"`.
- No hover-only essential information.

## 7. Performance, accessibility and SEO

- Use original Figma artwork/project imagery, not stock substitutions.
- Export large illustrations as optimized AVIF/WebP with responsive sizes.
- Explicit image dimensions/aspect ratios prevent layout shift.
- Lazy-load below-the-fold images; do not lazy-load the hero image if it is the LCP candidate.
- Use descriptive alt text for informative images; decorative art gets empty alt text.
- Use semantic header/nav/main/section/footer, one clear H1, logical heading order, skip link, keyboard navigation, and visible focus.
- Check contrast for muted copy on parchment and copy on dark green.
- Add page title/description, canonical URL when the final domain is known, Open Graph/social preview, favicon and theme color.
- Do not add fake structured data, unsupported review schema or invented claims.
- Avoid continuous animation loops, heavy blur filters and giant scroll event handlers.

## 8. Launch checklist

**Visual**
- [ ] Compare desktop at 1440px to Figma.
- [ ] Compare mobile at 390px; also test 360px and 430px.
- [ ] Test tablet ~768px and desktop 1280px/1440px.
- [ ] No clipping, unexpected wrapping, horizontal scrolling or accidental overlaps.
- [ ] Image crops/focal points match Figma.
- [ ] Font load/fallback does not cause a major layout shift.

**Interactions**
- [ ] All header/footer links reach the correct section.
- [ ] Hero CTAs work.
- [ ] Project cards have real destinations or are intentionally non-clickable.
- [ ] Email and résumé links work.
- [ ] Social links are verified.
- [ ] Hover, focus-visible and pressed states work.
- [ ] Keyboard-only and touch-only navigation work.
- [ ] Reduced motion disables parallax/reveal transforms and leaves content visible.

**Production**
- [ ] Replace every placeholder in `site-config.ts`.
- [ ] No broken links, empty hrefs, console errors or failed image requests.
- [ ] Lint, typecheck and production build pass.
- [ ] Lighthouse/PageSpeed reviewed; fix major accessibility, SEO and performance issues.
- [ ] Metadata, favicon, social preview and domain verified.
- [ ] Test deployed site on a real phone and desktop browser.
- [ ] Have a rollback-ready deployment.

## 9. Claude Code execution order

1. Inspect repository, stack, assets and scripts before editing.
2. Read the Figma desktop, mobile and design-system frames; inventory required assets and URLs.
3. Implement tokens and font loading first.
4. Build semantic section components one by one.
5. Implement section-specific scroll reveals with progressive enhancement and reduced-motion support.
6. Centralize links in site config and wire only verified destinations.
7. Run visual/responsive, accessibility, link, lint, typecheck and production-build checks.
8. Fix measured mismatches rather than redesigning the page.
9. Report what shipped, what links/assets were configured, checks passed, and any launch blockers.

**Priority:** make this feel like a thoughtful finished personal gift—not an animation demo. Fidelity, speed, accessibility and working links outrank effects.
