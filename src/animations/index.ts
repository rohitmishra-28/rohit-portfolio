import { aboutAnimation } from "./about";
import { allProjectsAnimation } from "./allProjects";
import { contactAnimation } from "./contact";
import { expertiseAnimation } from "./expertise";
import { footerAnimation } from "./footer";
import type { gsap } from "./gsap";
import { heroAnimation } from "./hero";
import { philosophyAnimation } from "./philosophy";
import { processAnimation } from "./process";
import { signatureAnimation } from "./signature";
import { workAnimation } from "./work";

type SectionAnimation = (scope: HTMLElement, mm: gsap.MatchMedia) => void;

/** One timeline per section, looked up by AnimatedSection's `animation` prop. */
export const animations = {
  hero: heroAnimation,
  about: aboutAnimation,
  work: workAnimation,
  allProjects: allProjectsAnimation,
  expertise: expertiseAnimation,
  philosophy: philosophyAnimation,
  process: processAnimation,
  signature: signatureAnimation,
  contact: contactAnimation,
  footer: footerAnimation,
} satisfies Record<string, SectionAnimation>;

export type AnimationName = keyof typeof animations;
