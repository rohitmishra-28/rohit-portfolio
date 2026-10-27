import { byAnim, conditions, gsap, onEnter, type Conditions } from "./gsap";

/**
 * 06 — Process. A connected journey.
 * Desktop: the antique-gold route draws across the row and each milestone
 * (Understand → Explore → Build → Refine) rises as the line reaches it, its
 * seal popping into place and its artwork opening.
 * Mobile: steps rise one by one as they enter the viewport. Nothing is
 * pinned on any screen size.
 */
export function processAnimation(scope: HTMLElement, mm: gsap.MatchMedia) {
  const $ = byAnim(scope);

  mm.add(conditions, (ctx) => {
    const { desktop } = ctx.conditions as Conditions;
    const steps = $("step");

    onEnter(scope, "top 75%")
      .from($("marker"), { autoAlpha: 0, y: 12, duration: 0.5 })
      .from(scope.querySelectorAll('[data-anim="mask"] > span'), { yPercent: 110, duration: 0.9 }, 0.1);

    if (desktop) {
      const tl = onEnter($("steps")[0], "top 80%").fromTo(
        $("route"),
        { scaleX: 0 },
        { scaleX: 1, transformOrigin: "left center", duration: 1.6, ease: "power1.inOut" },
        0,
      );
      steps.forEach((step, i) => {
        const at = 0.1 + i * 0.4;
        tl.from(step, { autoAlpha: 0, y: 40, duration: 0.7 }, at)
          .from(step.querySelector('[data-anim="seal"]'), { scale: 0.4, duration: 0.6, ease: "back.out(2.2)" }, at + 0.15)
          .fromTo(
            step.querySelector("picture"),
            { clipPath: "inset(0% 100% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "power2.inOut" },
            at + 0.25,
          );
      });
    } else {
      steps.forEach((step) => {
        onEnter(step, "top 88%").from(step, { autoAlpha: 0, y: 60, duration: 0.8 });
      });
    }

    onEnter($("note")[0], "top 95%").from($("note"), { autoAlpha: 0, y: 12 });
  });
}
