import { byAnim, gsap, onEnter } from "./gsap";

// Mobile Figma (120:23) overlaps the cards at these left offsets from the
// first card; the scroller spreads them out so every card stays readable.
const FIGMA_OVERLAP = [0, 132, 257];

const motion = "(prefers-reduced-motion: no-preference)";
const media = {
  // Pinning needs the whole 900px composition (heading + cards) to fit.
  pinned: `(min-width: 1024px) and (min-height: 700px) and ${motion}`,
  desktopShort: `(min-width: 1024px) and (max-height: 699px) and ${motion}`,
  mobile: `(max-width: 1023px) and ${motion}`,
};

/**
 * 03 — Featured Work.
 * Heading phrases unmask and the intro/CTA follow on entry (not scrubbed).
 * Desktop: the section pins at the top of the viewport and the cards are
 * revealed one at a time by scroll progress — each rises, then its image
 * opens upward — before the closing note appears and the pin releases.
 * Reversing the scroll reverses the sequence.
 * Short desktop windows and mobile skip the pin: desktop cards rise in a
 * stagger; on mobile the row enters in the Figma overlap and fans out into
 * the scrollable row (scrubbed, never pinned, so touch scrolling stays free).
 */
export function workAnimation(scope: HTMLElement, mm: gsap.MatchMedia) {
  const $ = byAnim(scope);

  mm.add(media, (ctx) => {
    const { pinned, mobile } = ctx.conditions as Record<keyof typeof media, boolean>;
    const cards = $("card");
    const row = $("cards")[0];
    const note = $("note");

    onEnter(scope, "top 75%")
      .from($("marker"), { autoAlpha: 0, y: 12, duration: 0.5 })
      .from(scope.querySelectorAll('[data-anim="mask"] > span'), { yPercent: 110, duration: 0.9, stagger: 0.12 }, 0.1)
      .from($("intro"), { autoAlpha: 0, y: 16 }, 0.45)
      .from($("cta"), { autoAlpha: 0, x: -12 }, 0.6);

    if (pinned) {
      // ~55% of a viewport of scrolling per card, plus a short hold at the end.
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: scope,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * 1.8)}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      cards.forEach((card, i) => {
        const at = i * 1.2;
        // opacity rather than autoAlpha keeps card links focusable.
        tl.from(card, { opacity: 0, y: 90, duration: 1 }, at)
          .fromTo(
            card.querySelector("picture"),
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9 },
            at + 0.2,
          )
          .from(card.querySelector("picture img"), { scale: 1.15, duration: 1.1 }, at + 0.2);
      });
      tl.from(note, { opacity: 0, y: 12, duration: 0.6 }).to({}, { duration: 0.5 });

      // Keyboard users tabbing into a card mid-sequence jump to the settled state.
      const reveal = () => {
        const st = tl.scrollTrigger;
        if (st && st.progress < 1) window.scrollTo({ top: st.end, behavior: "instant" });
      };
      scope.addEventListener("focusin", reveal);
      return () => scope.removeEventListener("focusin", reveal);
    }

    if (mobile) {
      // Offsets are measured, so they stay right after resizes and font loads.
      const overlapX = (i: number) =>
        FIGMA_OVERLAP[i] - (cards[i].offsetLeft - cards[0].offsetLeft);

      gsap.fromTo(
        cards,
        { x: (i: number) => overlapX(i) },
        {
          // No stagger: staggered tweens wouldn't render their overlapped
          // start state until their slot begins.
          x: 0,
          ease: "none",
          scrollTrigger: {
            trigger: row,
            start: "top 85%",
            end: "top 35%",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        },
      );
    } else {
      onEnter(row, "top 85%").from(cards, { autoAlpha: 0, y: 80, duration: 0.95, stagger: 0.16 });
    }

    onEnter(note[0], "top 95%").from(note, { autoAlpha: 0, y: 12 });
  });
}
