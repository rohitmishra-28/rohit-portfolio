"use client";

import { useEffect, useId, useState } from "react";
import type { Cta } from "@/content/types";
import { Logo, Monogram } from "./Logo";
import styles from "./SiteHeader.module.css";

// How many pixels of scroll count as a deliberate change of direction.
const DIRECTION_THRESHOLD = 6;

/**
 * Two states:
 * - Over the hero (Figma 11:48 / 120:5): transparent, full primary logo.
 * - Once the hero has scrolled away: a compact bar fixed to the top with the
 *   standalone monogram. It slides in when you scroll up and tucks away when
 *   you scroll down, so it never sits over the pinned sections while they
 *   play. It also shows whenever it holds keyboard focus or the menu is open.
 */
export function SiteHeader({ name, nav }: { name: string; nav: Cta[] }) {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [shown, setShown] = useState(false);
  const [focused, setFocused] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const hero = document.getElementById("top");
      const isCompact = y > (hero ? hero.offsetHeight * 0.8 : 600);
      setCompact(isCompact);
      if (!isCompact) setShown(false);
      else if (Math.abs(y - lastY) > DIRECTION_THRESHOLD) setShown(y < lastY);
      if (Math.abs(y - lastY) > DIRECTION_THRESHOLD || !isCompact) lastY = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      className={styles.header}
      data-compact={compact}
      data-shown={shown || open || focused}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <a href="#top" className={styles.brand} aria-label={`${name} — back to top`}>
        <Logo name={name} className={styles.logo} />
        <Monogram className={styles.monogram} />
      </a>

      <button
        type="button"
        className={styles.menuButton}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">{open ? "✕" : "☰"}</span>
        <span className="visually-hidden">{open ? "Close menu" : "Open menu"}</span>
      </button>

      {/* data-over-art: on desktop the links sit on the hero illustration. */}
      <nav
        aria-label="Primary"
        id={menuId}
        className={styles.nav}
        data-open={open}
        data-over-art
      >
        <ul className={styles.links}>
          {nav.map((link, i) => (
            <li key={i}>
              <a href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
