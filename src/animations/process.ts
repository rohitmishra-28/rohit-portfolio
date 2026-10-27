import { pinnedDeck } from "./deck";
import { byAnim, gsap, onEnter } from "./gsap";

const motion = "(prefers-reduced-motion: no-preference)";
const media = {
  // The ~600px band must fit with room around it.
  desktop: `(min-width: 1024px) and (min-height: 640px) and ${motion}`,
  mobile: `(max-width: 1023px) and (min-height: 600px) and ${motion}`,
  short: `(max-height: 599px) and ${motion}, (min-width: 1024px) and (max-height: 639px) and ${motion}`,
};

/**
 * 06 — Process. A connected journey, revealed by scroll while pinned.
 * Desktop: the band pins mid-viewport; the antique-gold route draws across
 * as you scroll and each milestone (Understand → Explore → Build → Refine)
 * opens top-down as the line reaches it, its seal popping in and its artwork
 * opening; the closing line follows, then the pin releases.
 * Mobile: the steps form a pinned deck — the first stays, the rest slide up
 * and stack on top of it.
 * Short windows: a simple coordinated entrance, no pin.
 */
export function processAnimation(scope: HTMLElement, mm: gsap.MatchMedia) {
  const $ = byAnim(scope);

  mm.add(media, (ctx) => {
    const { desktop, mobile } = ctx.conditions as Record<keyof typeof media, boolean>;
    const steps = $("step");
    const note = $("note");

    onEnter(scope, "top 75%")
      .from($("marker"), { autoAlpha: 0, y: 12, duration: 0.5 })
      .from(scope.querySelectorAll('[data-anim="mask"] > span'), { yPercent: 110, duration: 0.9 }, 0.1);

    // Seal pop and artwork opening for a step arriving at `at`.
    const details = (tl: gsap.core.Timeline, step: HTMLElement, at: number) => {
      if (desktop) tl.from(step.querySelector('[data-anim="seal"]'), { scale: 0.4, duration: 0.6, ease: "back.out(2.2)" }, at);
      tl.fromTo(
        step.querySelector("picture"),
        { clipPath: desktop ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 100% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "power2.inOut" },
        at + 0.1,
      );
    };

    if (desktop) {
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: scope,
          start: "center center",
          end: () => `+=${Math.round(window.innerHeight * 1.6)}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      tl.fromTo($("route"), { scaleX: 0 }, { scaleX: 1, transformOrigin: "left center", duration: 4, ease: "none" }, 0);
      steps.forEach((step, i) => {
        const at = i * 1.1;
        // Opens top-down with a clip instead of fading, so it never looks washed out.
        tl.fromTo(step, { clipPath: "inset(0% 0% 100% 0%)", y: 40 }, { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 0.9 }, at);
        details(tl, step, at + 0.3);
      });
      tl.from(note, { opacity: 0, y: 12, duration: 0.6 }).to({}, { duration: 0.4 });
      return;
    }

    onEnter(note[0], "top 95%").from(note, { autoAlpha: 0, y: 12 });

    if (mobile) {
      const first = onEnter(steps[0], "top 85%").from(steps[0], { y: 50, duration: 0.8 });
      details(first, steps[0], 0.2);
      return pinnedDeck({ scope, list: $("steps")[0], cards: steps, step: 16, perCard: 0.5, onLand: details });
    }

    steps.forEach((step) => {
      const tl = onEnter(step, "top 88%").from(step, { autoAlpha: 0, y: 50, duration: 0.8 });
      details(tl, step, 0.3);
    });
  });
}
