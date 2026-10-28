import { byAnim, conditions, gsap, type Conditions } from "./gsap";

/**
 * 01 — Hero. A short load timeline (no scroll trigger): the artwork settles
 * from a slight zoom while the copy arrives in order — eyebrow, headline,
 * divider, supporting copy, CTAs — and the scroll cue settles last.
 * The hero copy is pre-hidden by CSS ([data-hero-anim]); autoAlpha releases it.
 * Scrolling away then runs the scrubbed Hero → About parallax hand-off.
 */
export function heroAnimation(scope: HTMLElement, mm: gsap.MatchMedia) {
  const $ = byAnim(scope);

  mm.add(conditions, (ctx) => {
    const { desktop } = ctx.conditions as Conditions;
    document.documentElement.classList.add("hero-anim");

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    const artImg = scope.querySelectorAll("[data-anim=\"art\"] img");
    tl.fromTo(artImg, { scale: 1.06 }, { scale: 1, duration: 1.8, ease: "power2.out" }, 0)
      .fromTo($("eyebrow"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.15)
      .fromTo(
        // Desktop lines are blocks and stagger; on mobile the headline wraps
        // as one paragraph, so it moves as one.
        desktop ? $("line") : $("title"),
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.09 },
        0.25,
      )
      .fromTo(
        $("divider"),
        { autoAlpha: 0, scaleX: 0 },
        { autoAlpha: 1, scaleX: 1, transformOrigin: "left center", duration: 0.6 },
        0.6,
      )
      .fromTo($("lede"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.65)
      .fromTo($("ctas"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.8)
      .fromTo($("scroll"), { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 1.2);

    // The desktop headline isn't animated as a whole, so release it from the
    // pre-hide (its lines carry their own autoAlpha).
    if (desktop) gsap.set($("title"), { autoAlpha: 1 });

    // Hero → About hand-off. The hero pins once its bottom edge reaches the
    // bottom of the viewport (straight away when it fits the screen) and
    // About slides up over it from below. pinSpacing is off, so no scroll
    // distance is added: About covers the hero over exactly the hero's
    // visible height. Meanwhile the hero recedes — art drifts and zooms
    // slightly, the copy lifts and fades — for the parallax depth.
    const visible = () => Math.min(scope.offsetHeight, window.innerHeight);
    const handoff = {
      trigger: scope,
      start: () => (scope.offsetHeight > window.innerHeight ? "bottom bottom" : "top top"),
      end: () => `+=${visible()}`,
      scrub: true,
      invalidateOnRefresh: true,
    };
    gsap
      .timeline({ defaults: { ease: "none" }, scrollTrigger: { ...handoff, pin: true, pinSpacing: false } })
      // The zoom keeps the drifted art covering the top edge (4% > 3%).
      .to(artImg, { yPercent: 3, scale: 1.08 }, 0)
      .to($("content"), { y: desktop ? -80 : -40, opacity: 0.2 }, 0)
      .to($("scroll-cue"), { opacity: 0, duration: 0.2 }, 0);
  });
}
