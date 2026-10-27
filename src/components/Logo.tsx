/* eslint-disable @next/next/no-img-element -- static brand SVGs from Figma */
import styles from "./Logo.module.css";

type Theme = "primary" | "inverse";

/**
 * Brand logo from the Figma brand system (171:2): the custom R mark plus
 * "Rohit Mishra" set in Yatra One. Primary on light surfaces, inverse on dark.
 * The wordmark stays live text so it scales crisply and reads as the name.
 * Below 212px wide the brand guide calls for the standalone Monogram.
 */
export function Logo({ theme = "primary", className }: { theme?: Theme; className?: string }) {
  return (
    <span className={`${styles.logo} ${styles[theme]} ${className ?? ""}`}>
      <img src={`/brand/logo-mark-${theme}.svg`} alt="" width={80} height={80} className={styles.mark} />
      <span className={styles.wordmark}>Rohit Mishra</span>
    </span>
  );
}

/** Standalone R monogram (Figma 174:26), for compact spaces. */
export function Monogram({ theme = "primary", className }: { theme?: Theme; className?: string }) {
  return (
    <img
      src={`/brand/monogram-${theme}.svg`}
      alt=""
      width={112}
      height={112}
      className={`${styles.monogram} ${className ?? ""}`}
    />
  );
}
