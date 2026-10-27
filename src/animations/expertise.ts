import { pinnedDeck } from "./deck";
import { byAnim, gsap, onEnter } from "./gsap";

const motion = "(prefers-reduced-motion: no-preference)";
const media = {
  // The heading plus the stacked deck must fit in the viewport.
  desktop: `(min-width: 1024px) and (min-height: 700px) and ${motion}`,
  mobile: `(max-width: 1023px) and (min-height: 600px) and ${motion}`,
  short: `(max-height: 599px) and ${motion}, (min-width: 1024px) and (max-height: 699px) and ${motion}`,
};

/**
 * 04 — Expertise.
 * Heading phrases unmask on entry. The section then pins: the first card
 * stays put while each following card slides up from below and lands on top
 * of it, a little lower each time, until all four form a stack — then the pin
 * releases. As each card lands its emblem turns into place and its artwork
 * opens. Scroll-driven, so reversing lifts the cards back off.
 * Short windows skip the pin and each card simply rises as it enters.
 */
export function expertiseAnimation(scope: HTMLElement, mm: gsap.MatchMedia) {
  const $ = byAnim(scope);

  mm.add(media, (ctx) => {
    const { desktop, short } = ctx.conditions as Record<keyof typeof media, boolean>;
    const cards = $("card");

    onEnter(scope, "top 75%")
      .from($("marker"), { autoAlpha: 0, y: 12, duration: 0.5 })
      .from(scope.querySelectorAll('[data-anim="mask"] > span'), { yPercent: 110, duration: 0.9, stagger: 0.12 }, 0.1);

    // Emblem turn and artwork opening, for a card arriving at `at`.
    const details = (tl: gsap.core.Timeline, card: HTMLElement, at: number) => {
      const emblem = card.querySelector('[data-anim="card-text"] > picture');
      const art = card.querySelector('[data-anim="card-art"]');
      if (desktop && emblem) {
        tl.from(emblem, { scale: 0.6, rotation: -40, duration: 0.8, ease: "back.out(1.6)" }, at);
      }
      if (art) {
        tl.fromTo(art, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "power2.inOut" }, at)
          .from(art.querySelector("img"), { scale: 1.12, duration: 1.1, ease: "power2.out" }, at);
      }
    };

    if (short) {
      cards.forEach((card) => {
        const tl = onEnter(card, "top 88%").from(card, { autoAlpha: 0, y: 70, duration: 0.85 });
        details(tl, card, 0.25);
      });
      return;
    }

    // The first card arrives with the heading; the rest stack on top of it.
    const first = onEnter(cards[0], "top 85%").from(cards[0], { y: 60, duration: 0.8 });
    details(first, cards[0], 0.2);

    return pinnedDeck({
      scope,
      list: $("cards")[0],
      cards,
      step: desktop ? 24 : 16,
      perCard: desktop ? 0.6 : 0.5,
      onLand: details,
    });
  });
}
