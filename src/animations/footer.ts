import { byAnim, conditions, onEnter, type gsap } from "./gsap";

/**
 * 09 — Footer. A quiet finish: brand, link groups and quote rise together
 * in a light group stagger (not per link), and the bottom rule opens
 * outward from its ♧ motif.
 */
export function footerAnimation(scope: HTMLElement, mm: gsap.MatchMedia) {
  const $ = byAnim(scope);

  mm.add(conditions, () => {
    onEnter(scope, "top 90%")
      .from($("group"), { autoAlpha: 0, y: 20, duration: 0.6, stagger: 0.08 })
      .fromTo($("rule"), { clipPath: "inset(0% 50% 0% 50%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power2.inOut" }, 0.3)
      .from($("legal"), { autoAlpha: 0, duration: 0.6 }, 0.6);
  });
}
