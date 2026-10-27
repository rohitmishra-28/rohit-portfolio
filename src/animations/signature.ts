import { byAnim, conditions, gsap, onEnter, type Conditions } from "./gsap";

/**
 * 07 — Heritage to Digital. The most atmospheric transition: on desktop the
 * banyan-to-circuit artwork emerges from the dark — opacity and a widening
 * horizontal aperture — and then drifts very slightly with scroll. The
 * eyebrow, headline phrases and supporting line follow in a slow stagger.
 * Mobile has no artwork in the design, so only the copy animates.
 */
export function signatureAnimation(scope: HTMLElement, mm: gsap.MatchMedia) {
  const $ = byAnim(scope);

  mm.add(conditions, (ctx) => {
    const { desktop } = ctx.conditions as Conditions;
    const tl = onEnter(scope, "top 70%");

    if (desktop) {
      const art = $("art")[0];
      const img = art?.querySelector("img");
      tl.fromTo(
        art,
        { autoAlpha: 0, clipPath: "inset(18% 0% 18% 0%)" },
        { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "power2.inOut" },
        0,
      );
      if (img) {
        gsap.set(img, { scale: 1.06 });
        gsap.fromTo(img, { yPercent: -3 }, {
          yPercent: 3,
          ease: "none",
          scrollTrigger: { trigger: scope, start: "top bottom", end: "bottom top", scrub: true },
        });
      }
    }

    tl.from($("eyebrow"), { autoAlpha: 0, y: 10, duration: 0.6, stagger: 0.12 }, desktop ? 0.35 : 0)
      .from(scope.querySelectorAll('[data-anim="mask"] > span'), { yPercent: 110, duration: 1, stagger: 0.18 }, desktop ? 0.5 : 0.15)
      .from($("body"), { autoAlpha: 0, y: 14, duration: 0.7 }, desktop ? 0.95 : 0.65);
  });
}
