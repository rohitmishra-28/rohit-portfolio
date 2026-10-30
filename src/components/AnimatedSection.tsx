"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/animations/gsap";
import { animations, type AnimationName } from "@/animations";
import { scheduleSetup } from "@/animations/schedule";

type Props = {
  id: string;
  /** Which section timeline from src/animations to run. */
  animation: AnimationName;
  as?: "section" | "footer";
  className?: string;
  ariaLabelledby?: string;
  children: ReactNode;
};

/**
 * Wraps a server-rendered section and runs its GSAP timeline, scoped to the
 * section and reverted on unmount. Content is fully visible in the server
 * HTML; if a timeline throws, its partial setup is reverted so nothing is
 * left hidden.
 */
export function AnimatedSection({
  id,
  animation,
  as: Tag = "section",
  className,
  ariaLabelledby,
  children,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const scope = ref.current;
      // The CMS live preview shows the static layout.
      if (!scope || document.documentElement.hasAttribute("data-cms-preview")) return;
      const mm = gsap.matchMedia();
      const setup = () => {
        try {
          animations[animation](scope, mm);
        } catch (error) {
          mm.revert();
          document.documentElement.classList.add("anim-failed");
          console.error(`Animation "${animation}" failed; showing static content.`, error);
        }
      };
      // The hero's entrance plays on load; the rest wait their turn.
      const cancel = animation === "hero" ? (setup(), undefined) : scheduleSetup(setup);
      return () => {
        cancel?.();
        mm.revert();
      };
    },
    { scope: ref },
  );

  return (
    <Tag
      ref={ref as React.Ref<HTMLElement & HTMLDivElement>}
      id={id}
      className={className}
      aria-labelledby={ariaLabelledby}
    >
      {children}
    </Tag>
  );
}
