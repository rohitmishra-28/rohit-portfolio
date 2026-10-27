import { byAnim, gsap, onEnter } from "./gsap";

const motion = "(prefers-reduced-motion: no-preference)";
const media = {
  // The 610px band must fit with room around it.
  pinned: `(min-width: 1024px) and (min-height: 640px) and ${motion}`,
  desktopShort: `(min-width: 1024px) and (max-height: 639px) and ${motion}`,
  mobile: `(max-width: 1023px) and ${motion}`,
};

/**
 * 05 — Engineering Philosophy. Slower and more reflective than the card
 * sections: an editorial sequence rather than a card reveal.
 * Desktop: as the band scrolls in, the label and the first phrase ("Good
 * engineering") unmask. The band then pins in the middle of the viewport and
 * scroll progress completes the statement ("is felt, not just seen."),
 * brings in the supporting line, and then the three principles in turn —
 * left from the left, middle rising, right from the right — each glyph
 * turning into place, while the courtyard art drifts a few pixels. The pin
 * releases after a short hold. Reversing reverses it.
 * Mobile and short windows skip the pin: each principle draws its divider
 * (mobile) and slides in as it arrives.
 */
export function philosophyAnimation(scope: HTMLElement, mm: gsap.MatchMedia) {
  const $ = byAnim(scope);

  mm.add(media, (ctx) => {
    const { pinned, mobile } = ctx.conditions as Record<keyof typeof media, boolean>;
    const [first, ...rest] = gsap.utils.toArray<HTMLElement>(
      scope.querySelectorAll('[data-anim="mask"] > span'),
    );
    const principles = $("principle");
    const art = $("art");
    const artImg = art[0]?.querySelector("img");

    if (pinned) {
      onEnter(scope, "top 70%")
        .from(art, { autoAlpha: 0, duration: 1.4, ease: "power1.out" }, 0)
        .from($("marker"), { autoAlpha: 0, y: 12, duration: 0.6 }, 0.2)
        .from(first, { yPercent: 110, duration: 1.1 }, 0.3);

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: scope,
          start: "center center",
          end: () => `+=${Math.round(window.innerHeight * 1.6)}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      tl.from(rest, { yPercent: 110, duration: 1.2 }, 0)
        .from($("statement"), { opacity: 0, y: 18, duration: 1 }, 0.9);
      principles.forEach((p, i) => {
        const at = 2 + i * 0.9;
        tl.from(p, { opacity: 0, x: [-56, 0, 56][i] ?? 0, y: i === 1 ? 32 : 0, duration: 0.9 }, at)
          .from(p.querySelector('[data-anim="glyph"]'), { scale: 0, rotation: -90, duration: 0.7, ease: "back.out(2)" }, at + 0.2);
      });
      tl.to({}, { duration: 0.8 });
      if (artImg) {
        gsap.set(artImg, { scale: 1.05 });
        tl.fromTo(artImg, { y: -14 }, { y: 14, ease: "none", duration: tl.duration() }, 0);
      }
      return;
    }

    onEnter(scope, "top 70%")
      .from(art, { autoAlpha: 0, duration: 1.4, ease: "power1.out" }, 0)
      .from($("marker"), { autoAlpha: 0, y: 12, duration: 0.6 }, 0.2)
      .from([first, ...rest], { yPercent: 110, duration: 1.1, stagger: 0.18 }, 0.3)
      .from($("statement"), { autoAlpha: 0, y: 18, duration: 0.9 }, 0.9);

    if (mobile) {
      // Stacked far apart: each principle draws its divider and slides in
      // from alternating sides as it arrives.
      principles.forEach((principle, i) => {
        onEnter(principle, "top 85%")
          .from(principle.querySelector('[data-anim="rule"]'), { scaleX: 0, transformOrigin: "left center", duration: 0.9, ease: "power2.inOut" })
          .from(principle.querySelectorAll(":scope > :not([data-anim='rule'])"), { autoAlpha: 0, x: i % 2 === 0 ? -56 : 56, duration: 0.8, stagger: 0.06 }, 0.15);
      });
    } else {
      onEnter($("principles")[0], "top 85%").from(principles, {
        autoAlpha: 0,
        x: (i: number) => [-56, 0, 56][i] ?? 0,
        y: (i: number) => (i === 1 ? 32 : 0),
        duration: 0.85,
        stagger: 0.18,
      });
    }
  });
}
