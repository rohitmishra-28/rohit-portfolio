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
 * Items can override their stagger slot with `data-reveal-delay="<ms>"` and
 * the section duration with `data-reveal-duration="<ms>"`. Wrap items in
 * `data-reveal-group="<ms>"` to reveal them one after another, that many ms
 * apart, as soon as the group enters view; add `data-reveal-media="<query>"`
 * to group only at matching viewport sizes.
 *
 * Variants: `data-reveal` rises, `="fade"` only fades, `="line"` draws in
 * with scaleX, and `="slide"` starts from --from-x / --from-y (set per item
 * in the section's CSS, so the direction can change per breakpoint).
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

    // Items inside a [data-reveal-group] reveal together, one after another,
    // when the group enters view; everything else is observed on its own.
    // A group with data-reveal-media only groups while that query matches.
    const groups = Array.from(
      root.querySelectorAll<HTMLElement>("[data-reveal-group]"),
    ).filter((g) => !g.dataset.revealMedia || window.matchMedia(g.dataset.revealMedia).matches);
    const membersOf = new Map(groups.map((g) => [g, [] as HTMLElement[]]));
    const solo: HTMLElement[] = [];
    for (const item of items) {
      const group = item.parentElement?.closest<HTMLElement>("[data-reveal-group]");
      if (group && membersOf.has(group)) membersOf.get(group)!.push(item);
      else solo.push(item);
    }

    const setTiming = (item: HTMLElement, fallbackDelay: number) => {
      const explicit = item.dataset.revealDelay;
      const delay = explicit !== undefined ? Number(explicit) : fallbackDelay;
      item.style.setProperty("--reveal-delay", `${delay}ms`);
      if (item.dataset.revealDuration !== undefined) {
        item.style.setProperty("--reveal-duration", `${item.dataset.revealDuration}ms`);
      }
    };
    solo.forEach((item, index) => setTiming(item, index * stagger));
    membersOf.forEach((members, group) => {
      const step = Number(group.dataset.revealGroup) || stagger;
      members.forEach((item, index) => setTiming(item, index * step));
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLElement;
          const members = membersOf.get(target) ?? [target];
          members.forEach((m) => m.classList.add("is-visible"));
          observer.unobserve(target);
        }
      },
      { threshold },
    );

    root.classList.add("motion-ready");
    solo.forEach((item) => observer.observe(item));
    groups.forEach((group) => observer.observe(group));

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
