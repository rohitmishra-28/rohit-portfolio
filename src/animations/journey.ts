import { byAnim, gsap } from "./gsap";

/**
 * 03 — Journey. The section pins; the figure and the background stay put
 * while scrolling steps through the chapters, oldest first. Each step lifts
 * the current chapter's label, dates and card contents away and brings the
 * next one up in their place; the scroll snaps to whole chapters. The
 * "scroll to follow" hint leaves on the last chapter.
 *
 * Same treatment on phones and desktop. Pins from the top when the section
 * fits the window, otherwise once its bottom reaches the bottom, so the card
 * is always fully in view. Reduced motion: no pin, the chapters stay a list.
 */
export function journeyAnimation(scope: HTMLElement, mm: gsap.MatchMedia) {
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const $ = byAnim(scope);
    const chapters = $("chapter");
    if (chapters.length < 2) return;

    // Switches the CSS to the overlapping layout (JourneySection.module.css).
    scope.dataset.pinned = "";
    const parts = (chapter: HTMLElement) =>
      gsap.utils.toArray<HTMLElement>(chapter.querySelectorAll('[data-anim="lead"], [data-anim="when"], [data-anim="card"]'));
    // Opacity only (not visibility), so screen readers still get every chapter.
    gsap.set(chapters.slice(1).flatMap(parts), { opacity: 0 });

    const steps = chapters.length - 1;
    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut", duration: 0.4 },
      scrollTrigger: {
        trigger: scope,
        start: () => (scope.offsetHeight > window.innerHeight ? "bottom bottom" : "top top"),
        end: () => `+=${Math.round(window.innerHeight * 0.75 * steps)}`,
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        // Nearest chapter, not projected from scroll speed, so a flick
        // can't skip chapters.
        snap: { snapTo: 1 / steps, inertia: false, duration: { min: 0.2, max: 0.6 }, delay: 0.05, ease: "power1.inOut" },
      },
    });

    // Chapter k is fully shown at time k; the swap to k + 1 runs between.
    chapters.slice(1).forEach((next, k) => {
      tl.to(parts(chapters[k]), { opacity: 0, y: -24, stagger: 0.04 }, k + 0.2).fromTo(
        parts(next),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, stagger: 0.04, ease: "power2.out" },
        k + 0.35,
      );
    });
    tl.to($("hint"), { opacity: 0, duration: 0.3 }, steps - 1 + 0.2).set({}, {}, steps);

    return () => {
      delete scope.dataset.pinned;
    };
  });
}
