import { byAnim, conditions, gsap, onEnter, type Conditions } from "./gsap";

/**
 * 08 — Contact. Shifts to a clear invitation: the workspace art opens
 * (left to right on desktop, top down on mobile), the eyebrow and headline
 * arrive as one group, the copy follows ~80ms later and the contact actions
 * land with a short, confident rise. Kept brisk so the actions are never
 * waiting on the scroll.
 */
export function contactAnimation(scope: HTMLElement, mm: gsap.MatchMedia) {
  const $ = byAnim(scope);

  mm.add(conditions, (ctx) => {
    const { desktop } = ctx.conditions as Conditions;
    const art = $("art")[0];

    onEnter(scope, "top 75%")
      .fromTo(
        art,
        { clipPath: desktop ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 100% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "power2.inOut" },
        0,
      )
      .from($("heading"), { autoAlpha: 0, y: 24, duration: 0.7 }, desktop ? 0.3 : 0.2)
      .from($("copy"), { autoAlpha: 0, y: 16, duration: 0.6 }, desktop ? 0.38 : 0.28)
      .from($("action"), { autoAlpha: 0, y: 16, scale: 0.97, duration: 0.55, stagger: 0.1, ease: "back.out(1.4)", clearProps: "transform" }, desktop ? 0.5 : 0.4)
      .from($("signoff"), { autoAlpha: 0, duration: 0.6, stagger: 0.1 }, desktop ? 0.75 : 0.65);
  });
}
