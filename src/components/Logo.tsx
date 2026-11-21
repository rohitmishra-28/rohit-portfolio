/* eslint-disable @next/next/no-img-element -- static brand SVGs from Figma */
import { asset } from "@/lib/base-path";
import styles from "./Logo.module.css";

type Theme = "primary" | "inverse";

/**
 * Brand logo from the Figma brand system (171:2): the custom R mark plus
 * the site name set in Yatra One. Primary on light surfaces, inverse on dark.
 * The wordmark stays live text so it scales crisply and reads as the name.
 * Below 212px wide the brand guide calls for the standalone Monogram.
 */
export function Logo({
  name,
  theme = "primary",
  className,
}: {
  name: string;
  theme?: Theme;
  className?: string;
}) {
  return (
    <span className={`${styles.logo} ${styles[theme]} ${className ?? ""}`}>
      {/* Inline (same paths as public/brand/logo-mark-*.svg) so the mark paints
          with the wordmark instead of popping in after its own request. */}
      <svg viewBox="0 0 80 80" width={80} height={80} aria-hidden="true" className={styles.mark}>
        <path
          d="M14 70V12H36C51 12 60 20 60 33C60 43 54 50 44 53L64 70H46L28 54H26V70H14ZM26 24V43H35C43 43 48 40 48 33C48 27 43 24 35 24H26Z"
          fillRule="evenodd"
          fill={theme === "primary" ? "#18291F" : "#FBF6ED"}
        />
        <rect x="65" y="12" width="8" height="8" fill="#C65B32" />
      </svg>
      <span className={styles.wordmark}>{name}</span>
    </span>
  );
}

/** Standalone R monogram (Figma 174:26), for compact spaces. */
export function Monogram({ theme = "primary", className }: { theme?: Theme; className?: string }) {
  return (
    <img
      src={asset(`/brand/monogram-${theme}.svg`)}
      alt=""
      width={112}
      height={112}
      className={`${styles.monogram} ${className ?? ""}`}
    />
  );
}
