"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/animations/gsap";

/**
 * Page-level motion housekeeping.
 * - Recalculates ScrollTrigger positions if web fonts settle after load
 *   (ScrollTrigger already refreshes on load itself).
 * - Restores the scroll position on reload / back-forward ourselves. The
 *   browser's own restoration runs before the pinned sections add their
 *   scroll distance and lands in the wrong place, so the head script sets
 *   history.scrollRestoration to "manual" and we restore once the pins exist.
 */
export function MotionRoot() {
  useEffect(() => {
    const key = `scroll:${location.pathname}`;
    const save = () => {
      try {
        sessionStorage.setItem(key, String(Math.round(window.scrollY)));
      } catch {}
    };
    window.addEventListener("pagehide", save);

    const nav = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    const returning = nav?.type === "reload" || nav?.type === "back_forward";
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(key);
    } catch {}

    // Runs on "load", after ScrollTrigger's own load refresh (its listener is
    // registered first, at import), or straight away if the page has loaded:
    // triggers created after load measure themselves immediately. A second
    // refresh only happens if web fonts finish later (it's a long task on
    // phones), then the saved position is restored against the built pins.
    const settle = async () => {
      if (document.fonts && document.fonts.status !== "loaded") {
        await document.fonts.ready;
        ScrollTrigger.refresh();
      }
      if (returning && saved && !location.hash) window.scrollTo(0, Number(saved));
    };
    if (document.readyState === "complete") settle();
    else window.addEventListener("load", settle, { once: true });

    return () => {
      window.removeEventListener("pagehide", save);
      window.removeEventListener("load", settle);
    };
  }, []);

  return null;
}
