import { sectionLinks, siteConfig } from "@/lib/site-config";
import styles from "./SiteHeader.module.css";

// Structure and destinations only; visual styling follows the Figma
// Navigation frame (11:48) when the Hero section is built.
export function SiteHeader() {
  return (
    <header className={styles.header}>
      <a href="#top" className={styles.wordmark}>
        {siteConfig.name}
      </a>
      <nav aria-label="Primary">
        <ul className={styles.links}>
          {sectionLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
