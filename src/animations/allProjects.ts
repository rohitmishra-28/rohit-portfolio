import { byAnim, conditions, gsap } from "./gsap";

/**
 * All projects. Eyebrow and heading rise, the region rules draw in, then the
 * rows follow in a light stagger — a quiet list after the pinned cards.
 */
export function allProjectsAnimation(scope: HTMLElement, mm: gsap.MatchMedia) {
  const $ = byAnim(scope);

  mm.add(conditions, () => {
    // Not onEnter(): this section sits between pinned sections, and a `once`
    // trigger that is already passed kills itself mid-refresh when the page
    // reloads further down, which breaks the refresh of every later pin.
    gsap
      .timeline({ scrollTrigger: { trigger: scope, start: "top 80%", toggleActions: "play none none none" } })
      .from([...$("eyebrow"), ...$("heading")], { autoAlpha: 0, y: 16, stagger: 0.1 })
      .from($("region"), { autoAlpha: 0, y: 12, stagger: 0.1 }, 0.25)
      .from($("row"), { autoAlpha: 0, y: 14, duration: 0.5, stagger: 0.04 }, 0.4);
  });
}
