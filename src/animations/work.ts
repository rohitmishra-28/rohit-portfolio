import { byAnim, gsap, onEnter } from "./gsap";

// Mobile Figma (120:23) layers the cards in a stepped fan (each one further
// right and lower). The pinned mobile sequence keeps that layering but steps
// each card 40px right of the last, so the newest card is always fully on
// screen instead of running off the edge as in the frame.
const MOBILE_FAN_STEP = 40;

const motion = "(prefers-reduced-motion: no-preference)";
const media = {
  // Pinning needs the whole 900px composition (heading + cards) to fit.
  pinned: `(min-width: 1024px) and (min-height: 700px) and ${motion}`,
  desktopShort: `(min-width: 1024px) and (max-height: 699px) and ${motion}`,
  // The heading plus the tallest card must fit to pin on phones.
  mobilePinned: `(max-width: 1023px) and (min-height: 600px) and ${motion}`,
  mobileShort: `(max-width: 1023px) and (max-height: 599px) and ${motion}`,
};

/**
 * 03 — Featured Work.
 * Heading phrases unmask and the intro/CTA follow on entry (not scrubbed).
 * Desktop: the section pins at the top of the viewport and the cards are
 * revealed one at a time by scroll progress — each rises, then its image
 * opens upward — before the closing note appears and the pin releases.
 * Reversing the scroll reverses the sequence.
 * Mobile: the section pins too. Tarinika stays put while Paksha, then
 * Novology, slide in from the right and land on top of it in the stepped
 * Figma fan, each fully on screen as it arrives. Reversing slides them out.
 * Short windows skip the pin: cards rise in a stagger, and on mobile the row
 * stays horizontally scrollable.
 */
export function workAnimation(scope: HTMLElement, mm: gsap.MatchMedia) {
  const $ = byAnim(scope);

  mm.add(media, (ctx) => {
    const { pinned, mobilePinned } = ctx.conditions as Record<keyof typeof media, boolean>;
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

    if (mobilePinned) {
      // The row is a horizontal scroller without JS; while this sequence
      // owns it, the cards are positioned by transforms instead.
      gsap.set(row, { overflowX: "visible" });
      const first = cards[0];
      const left = (card: HTMLElement) => card.offsetLeft - row.scrollLeft;

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: scope,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * 0.6 * (cards.length - 1))}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      cards.slice(1).forEach((card, n) => {
        const i = n + 1;
        tl.fromTo(
          card,
          // From just off the right edge to its step in the fan.
          { x: () => window.innerWidth + 20 - left(card) },
          { x: () => left(first) + i * MOBILE_FAN_STEP - left(card), duration: 1 },
          n * 1.2,
        ).from(card.querySelector("picture img"), { scale: 1.12, duration: 1.1 }, n * 1.2 + 0.2);
      });
      tl.to({}, { duration: 0.4 });
      return;
    }

    // Short windows: no pin.
    onEnter(row, "top 85%").from(cards, { autoAlpha: 0, y: 80, duration: 0.95, stagger: 0.16 });
    onEnter(note[0], "top 95%").from(note, { autoAlpha: 0, y: 12 });
  });
}
