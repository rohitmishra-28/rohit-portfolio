import { projects } from "@/lib/projects";
import { ctaLinks, mailtoHref, sectionLinks, siteConfig } from "@/lib/site-config";
import { SectionReveal } from "./SectionReveal";
import styles from "./SiteFooter.module.css";

const navigation = [{ label: "Home", href: "#top" }, ...sectionLinks];

const resources = [
  { label: "Download résumé", href: siteConfig.resume.href, download: true },
  { label: "LinkedIn", href: siteConfig.social.linkedin, external: true },
  { label: "GitHub", href: siteConfig.social.github, external: true },
  { label: "Email me", href: mailtoHref },
];

// 09 — Footer / Heritage colophon (Figma desktop 11:210, mobile 120:126).
// A single fade-in once visible; links are not staggered.
export function SiteFooter() {
  return (
    <SectionReveal id="footer" as="footer" className={styles.footer} duration={340}>
      <div data-reveal="fade" className={styles.inner}>
        <div className={styles.brand}>
          <p className={styles.name}>
            <span className={styles.mark} aria-hidden="true">
              ❋
            </span>
            {siteConfig.name}
          </p>
          <p className={styles.role}>Frontend Developer • Shopify Specialist</p>
          <p className={styles.tagline}>Crafting digital experiences with Indian roots and a global vision.</p>
          <ul className={styles.social}>
            <li>
              <a href={siteConfig.social.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn (opens in a new tab)">
                in
              </a>
            </li>
            <li>
              <a href={siteConfig.social.github} target="_blank" rel="noreferrer" aria-label="GitHub (opens in a new tab)">
                gh
              </a>
            </li>
            <li>
              <a href={mailtoHref} aria-label={`Email ${siteConfig.email}`}>
                ✉
              </a>
            </li>
          </ul>
        </div>

        <nav className={styles.columns} aria-label="Footer">
          <div className={styles.column}>
            <h2 className={styles.heading}>Navigation</h2>
            <ul className={styles.list}>
              {navigation.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.column}>
            <h2 className={styles.heading}>Featured work</h2>
            <ul className={styles.list}>
              {projects.map((p) => (
                <li key={p.slug}>
                  <a href={p.href ?? "#work"}>{p.name}</a>
                </li>
              ))}
              <li className={styles.desktopOnly}>
                <a href={ctaLinks.viewAllProjects}>View all projects</a>
              </li>
            </ul>
          </div>
          <div className={styles.column}>
            <h2 className={styles.heading}>Resources</h2>
            <ul className={styles.list}>
              {resources.map((r) => (
                <li key={r.label}>
                  <a
                    href={r.href}
                    {...(r.download && { download: siteConfig.resume.downloadName })}
                    {...(r.external && { target: "_blank", rel: "noreferrer" })}
                  >
                    {r.label}
                    {r.external && <span className="visually-hidden"> (opens in a new tab)</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <blockquote className={styles.quote}>
          <p>“Technology is a modern medium. Our culture is an endless source of inspiration.”</p>
          <span className={styles.ornament} aria-hidden="true" />
        </blockquote>

        <div className={styles.bottom}>
          <span className={styles.rule} aria-hidden="true">
            <span className={styles.ruleGlyph}>♧</span>
          </span>
          <p>© 2026 Rohit Mishra. All rights reserved.</p>
          <p>Built with purpose, inspired by Bharat.</p>
        </div>
      </div>
    </SectionReveal>
  );
}
