import { gsap, ScrollTrigger } from "./gsap";

type DeckOptions = {
  /** Section to pin (pinned at the top of the viewport). */
  scope: HTMLElement;
  /** The cards' list element (gets a compensating negative margin). */
  list: HTMLElement;
  cards: HTMLElement[];
  /** Vertical offset between stacked cards, in px, so each edge peeks out. */
  step: number;
  /** Scroll distance per incoming card, as a fraction of the viewport height. */
  perCard: number;
  /** Adds extra tweens for a card as it lands (e.g. its artwork opening). */
  onLand?: (tl: gsap.core.Timeline, card: HTMLElement, at: number) => void;
};

/**
 * Pinned card deck: the first card stays where the layout puts it, and each
 * following card slides up from below the viewport (fully opaque) and lands
 * on top of it, `step` px lower than the last, building a stack. Driven by
 * scroll progress, so reversing the scroll lifts the cards off again.
 *
 * The cards end the pin stacked rather than in their layout positions, so a
 * negative margin on the list (applied before ScrollTrigger measures
 * anything) keeps the section's height equal to that stacked state.
 * Returns a cleanup function for gsap.matchMedia.
 */
export function pinnedDeck({ scope, list, cards, step, perCard, onLand }: DeckOptions) {
  const last = cards.length - 1;
  // Layout distance of each card below the first (transforms don't affect it).
  const offset = (i: number) => cards[i].offsetTop - cards[0].offsetTop;
  // First card's distance from the section top, i.e. its viewport top once pinned.
  const top0 = () => cards[0].getBoundingClientRect().top - scope.getBoundingClientRect().top;

  const compensate = () => {
    list.style.marginBottom = `${-Math.max(0, offset(last) - last * step)}px`;
  };
  compensate();
  ScrollTrigger.addEventListener("refreshInit", compensate);

  // A soft shadow separates each card from the one it covers.
  gsap.set(cards.slice(1), { boxShadow: "0 -10px 28px rgb(30 33 27 / 0.12)" });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scope,
      start: "top top",
      end: () => `+=${Math.round(window.innerHeight * perCard * last)}`,
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  cards.slice(1).forEach((card, n) => {
    const i = n + 1;
    const at = n * 1.2;
    tl.fromTo(
      card,
      // Start just below the viewport, end `step` px below the previous card.
      { y: () => window.innerHeight + 24 - (top0() + offset(i)) },
      { y: () => i * step - offset(i), duration: 1, ease: "power2.out" },
      at,
    );
    onLand?.(tl, card, at + 0.55);
  });
  tl.to({}, { duration: 0.4 });

  return () => {
    ScrollTrigger.removeEventListener("refreshInit", compensate);
    list.style.marginBottom = "";
  };
}
