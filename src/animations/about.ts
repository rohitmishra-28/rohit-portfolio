import { byAnim, conditions, gsap, onEnter, type Conditions } from "./gsap";

/**
 * 02 — About. A calm hand-off from the hero: label, then the headline
 * phrases unmask, the bio follows, and the workspace art opens with a clip
 * (sweeping in from the right on desktop, down on mobile). The highlights
 * then slide in one after another — left column from the left, right column
 * from the right. A scrubbed offset completes the Hero → About hand-off.
 */
export function aboutAnimation(scope: HTMLElement, mm: gsap.MatchMedia) {
  const $ = byAnim(scope);

  mm.add(conditions, (ctx) => {
    const { desktop } = ctx.conditions as Conditions;
    const art = $("art")[0];

    onEnter(scope, "top 70%")
      .fromTo(
        art,
        { clipPath: desktop ? "inset(0% 0% 0% 100%)" : "inset(0% 0% 100% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power2.inOut" },
        0,
      )
      .from(art.querySelector("img"), { scale: 1.08, duration: 1.8, ease: "power2.out" }, 0)
      .from($("marker"), { autoAlpha: 0, y: 12, duration: 0.5 }, 0.1)
      .from(scope.querySelectorAll('[data-anim="mask"] > span'), { yPercent: 110, duration: 0.9, stagger: 0.12 }, 0.2)
      .from($("bio"), { autoAlpha: 0, y: 20 }, 0.6);

    const highlights = $("highlight");
    onEnter($("highlights")[0], "top 85%").from(highlights, {
      autoAlpha: 0,
      x: (i: number) => (i % 2 === 0 ? -56 : 56),
      duration: 0.8,
      stagger: 0.16,
    });

    if ($("cta").length) onEnter($("cta")[0], "top 92%").from($("cta"), { autoAlpha: 0, y: 16 });

    // Hero → About hand-off, About's half (scrubbed, no pin): while About
    // rises into view its artwork and copy column travel a little less than
    // the page, so the section settles into place as it becomes the focus.
    const emerge = { trigger: scope, start: "top bottom", end: "top top", scrub: true };
    // Moves the art's wrapper, not the image: any gap it opens is plain
    // parchment (mobile) or below the fold (desktop).
    gsap.fromTo(art, { y: desktop ? -90 : -30 }, { y: 0, ease: "none", scrollTrigger: emerge });
    if (desktop) gsap.fromTo($("column"), { y: 60 }, { y: 0, ease: "none", scrollTrigger: emerge });
  });
}
