"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

export type RevealSettings = {
  /** translateY start offset in px. */
  distance?: number;
  /** Transition duration in ms. */
  duration?: number;
  /** Delay added per [data-reveal] item, in document order, in ms. */
  stagger?: number;
  /** IntersectionObserver threshold. */
  threshold?: number;
};

type Props = RevealSettings & {
  id: string;
  as?: "section" | "footer";
  className?: string;
  ariaLabelledby?: string;
  children: ReactNode;
};

/**
 * Wraps one page section and reveals its `[data-reveal]` descendants once as
 * they scroll into view. Each section passes its own timing, so every section
 * animates independently.
 *
 * Progressive enhancement: content is visible in the server HTML. Only after
 * the observer is running does the section get `.motion-ready` (which hides
 * items until revealed). No IntersectionObserver → nothing is hidden.
 * Reduced motion is handled in CSS.
 *
 * Items can override their stagger slot with `data-reveal-delay="<ms>"`.
 */
export function SectionReveal({
  id,
  as: Tag = "section",
  className,
  ariaLabelledby,
  distance = 16,
  duration = 420,
  stagger = 0,
  threshold = 0.15,
  children,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !("IntersectionObserver" in window)) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (items.length === 0) return;

    items.forEach((item, index) => {
      const explicit = item.dataset.revealDelay;
      const delay = explicit !== undefined ? Number(explicit) : index * stagger;
      item.style.setProperty("--reveal-delay", `${delay}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold },
    );

    root.classList.add("motion-ready");
    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [stagger, threshold]);

  const style = {
    "--reveal-distance": `${distance}px`,
    "--reveal-duration": `${duration}ms`,
  } as CSSProperties;

  return (
    <Tag
      ref={ref as React.Ref<HTMLElement & HTMLDivElement>}
      id={id}
      className={className}
      aria-labelledby={ariaLabelledby}
      style={style}
    >
      {children}
    </Tag>
  );
}
