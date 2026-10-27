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
 * - Sends in-page links to a pinned section to the start of its pin.
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

    // In-page links to a pinned section land where its pin begins, so the
    // sequence starts from the beginning (sections pinned mid-viewport would
    // otherwise open partway through). Other links keep native behaviour.
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
      const link = (event.target as Element).closest?.<HTMLAnchorElement>('a[href^="#"]');
      const target = link && document.getElementById(link.hash.slice(1));
      const pin = target && ScrollTrigger.getAll().find((st) => st.pin === target);
      if (!pin) return;
      event.preventDefault();
      window.scrollTo(0, pin.start);
      history.pushState(null, "", link.hash);
    };
    document.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("pagehide", save);
      window.removeEventListener("load", settle);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
