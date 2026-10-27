import { byAnim, gsap, onEnter, ScrollTrigger } from "./gsap";

const motion = "(prefers-reduced-motion: no-preference)";
const media = {
  // Needs room for the heading plus at least one full card.
  pinned: `(min-width: 1024px) and (min-height: 700px) and ${motion}`,
  desktopShort: `(min-width: 1024px) and (max-height: 699px) and ${motion}`,
  mobile: `(max-width: 1023px) and ${motion}`,
};

const BOTTOM_MARGIN = 40;

/**
 * 04 — Expertise.
 * Heading phrases unmask on entry. On desktop the section then pins with the
 * heading held at the top, and scroll progress reveals the four cards one at
 * a time into their layered Figma positions: each card rises, its emblem
 * turns into place and its artwork opens from the top. The list slides up
 * beneath the heading as it goes so the newest card is always fully in view;
 * the pin releases once the last card has settled. Reversing reverses it.
 * Short desktop windows and mobile skip the pin: each card simply rises as
 * it enters (mobile keeps its separate stacked panels).
 */
export function expertiseAnimation(scope: HTMLElement, mm: gsap.MatchMedia) {
  const $ = byAnim(scope);

  mm.add(media, (ctx) => {
    const { pinned, desktopShort } = ctx.conditions as Record<keyof typeof media, boolean>;
    const cards = $("card");
    const list = $("cards")[0];
    const header = scope.querySelector<HTMLElement>("[data-anim='marker']")!.parentElement!;

    onEnter(scope, "top 75%")
      .from($("marker"), { autoAlpha: 0, y: 12, duration: 0.5 })
      .from(scope.querySelectorAll('[data-anim="mask"] > span'), { yPercent: 110, duration: 0.9, stagger: 0.12 }, 0.1);

    const cardParts = (card: HTMLElement) => ({
      text: card.querySelectorAll('[data-anim="card-text"] > :not(picture)'),
      emblem: card.querySelector('[data-anim="card-text"] > picture'),
      art: card.querySelector('[data-anim="card-art"]'),
      artImg: card.querySelector('[data-anim="card-art"] img'),
    });

    if (pinned) {
      // How far the list must slide under the heading for the last card to
      // sit fully on screen.
      const shift = () =>
        Math.max(0, header.offsetHeight + list.offsetHeight - (window.innerHeight - BOTTOM_MARGIN));
      const step = 1.2;

      // The list ends the pin raised by shift(). A matching negative margin
      // keeps the section's layout height equal to that final state, so no
      // empty band follows it. It's applied before ScrollTrigger measures
      // anything (now and on every refresh) so later triggers line up.
      const compensate = () => {
        list.style.marginBottom = `${-shift()}px`;
      };
      compensate();
      ScrollTrigger.addEventListener("refreshInit", compensate);

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: scope,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * 0.55 * cards.length + shift())}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      cards.forEach((card, i) => {
        const at = i * step;
        const { text, emblem, art, artImg } = cardParts(card);
        // opacity rather than autoAlpha keeps any future card links focusable.
        tl.from(card, { opacity: 0, y: 120, duration: 1 }, at)
          .from(text, { opacity: 0, y: 14, stagger: 0.06, duration: 0.5 }, at + 0.3);
        if (emblem) tl.from(emblem, { opacity: 0, scale: 0.6, rotation: -40, duration: 0.8, ease: "back.out(1.6)" }, at + 0.35);
        if (art) {
          tl.fromTo(art, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "power2.inOut" }, at + 0.3)
            .from(artImg, { scale: 1.12, duration: 1.1 }, at + 0.3);
        }
      });
      tl.fromTo(list, { y: 0 }, { y: () => -shift(), ease: "none", duration: (cards.length - 1) * step - 0.2 }, step)
        .to({}, { duration: 0.5 });
      return () => {
        ScrollTrigger.removeEventListener("refreshInit", compensate);
        list.style.marginBottom = "";
      };
    }

    cards.forEach((card) => {
      const { text, emblem, art, artImg } = cardParts(card);
      const tl = onEnter(card, "top 88%")
        .from(card, { autoAlpha: 0, y: 70, duration: 0.85 })
        .from(text, { autoAlpha: 0, y: 14, stagger: 0.06, duration: 0.5 }, 0.2);
      if (art) {
        tl.fromTo(art, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power2.inOut" }, 0.25)
          .from(artImg, { scale: 1.12, duration: 1.4, ease: "power2.out" }, 0.25);
      }
      if (desktopShort && emblem) {
        tl.from(emblem, { autoAlpha: 0, scale: 0.6, rotation: -40, duration: 0.9, ease: "back.out(1.6)" }, 0.3);
      }
    });
  });
}
