import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);
gsap.defaults({ ease: "power3.out", duration: 0.7 });

/**
 * matchMedia conditions shared by every section. There is deliberately no
 * branch for reduced motion: nothing is set up, so content stays put.
 */
export const conditions = {
  desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
};

export type Conditions = { desktop: boolean; mobile: boolean };

/** Scoped selector for elements tagged `data-anim="<name>"` inside a section. */
export const byAnim = (scope: HTMLElement) => (name: string) =>
  gsap.utils.toArray<HTMLElement>(scope.querySelectorAll(`[data-anim="${name}"]`));

/** A timeline that plays once when `trigger` scrolls into view. */
export const onEnter = (trigger: Element, start = "top 80%") =>
  gsap.timeline({ scrollTrigger: { trigger, start, once: true } });

export { gsap, ScrollTrigger, useGSAP };
