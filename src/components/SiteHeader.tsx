"use client";

import { useEffect, useId, useState } from "react";
import { sectionLinks, siteConfig } from "@/lib/site-config";
import styles from "./SiteHeader.module.css";

// Figma: desktop Navigation (11:48) overlays the hero art; mobile (120:5/120:6)
// shows the wordmark and a menu button.
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={styles.header}>
      <a href="#top" className={styles.brand}>
        <span className={styles.monogram} aria-hidden="true">
          ◈
        </span>
        <span className={styles.wordmark}>{siteConfig.name}</span>
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
          {sectionLinks.map((link) => (
            <li key={link.href}>
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
