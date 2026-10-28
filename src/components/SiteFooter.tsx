import { mailtoHref, resolveLink } from "@/content/links";
import type { FooterContent, Project, SiteContent } from "@/content/types";
import { AnimatedSection } from "./AnimatedSection";
import { Logo } from "./Logo";
import { SocialIcon } from "./SocialIcon";
import styles from "./SiteFooter.module.css";

type Props = { content: FooterContent; site: SiteContent; projects: Project[] };

// 09 — Footer / Heritage colophon (Figma desktop 11:210, mobile 120:126).
// Timeline in src/animations/footer.ts.
export function SiteFooter({ content, site, projects }: Props) {
  const navigation = [{ label: content.homeLabel, href: "#top" }, ...site.nav];
  const viewAll = resolveLink(content.viewAllHref, site);

  return (
    <AnimatedSection id="footer" as="footer" animation="footer" className={styles.footer}>
      <div className={styles.inner}>
        <div data-anim="group" className={styles.brand}>
          {/* Inverse logo on the dark colophon (Figma brand system 171:2). */}
          <p className={styles.name}>
            <Logo name={site.name} theme="inverse" />
          </p>
          <p className={styles.role}>{content.role}</p>
          <p className={styles.tagline}>{content.tagline}</p>
          <ul className={styles.social}>
            <li>
              <a href={site.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn (opens in a new tab)">
                <SocialIcon name="linkedin" />
              </a>
            </li>
            <li>
              <a href={site.github} target="_blank" rel="noreferrer" aria-label="GitHub (opens in a new tab)">
                <SocialIcon name="github" />
              </a>
            </li>
            <li>
              <a href={mailtoHref(site)} aria-label={`Email ${site.email}`}>
                <SocialIcon name="email" />
              </a>
            </li>
          </ul>
        </div>

        <nav className={styles.columns} aria-label="Footer">
          <div data-anim="group" className={styles.column}>
            <h2 className={styles.heading}>{content.navigationHeading}</h2>
            <ul className={styles.list}>
              {navigation.map((link, i) => (
                <li key={i}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div data-anim="group" className={styles.column}>
            <h2 className={styles.heading}>{content.workHeading}</h2>
            <ul className={styles.list}>
              {projects.map((p, i) => (
                <li key={i}>
                  {p.href.trim() ? (
                    <a href={p.href} target="_blank" rel="noreferrer">
                      {p.name}
                      <span className="visually-hidden"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    <a href="#work">{p.name}</a>
                  )}
                </li>
              ))}
              <li className={styles.desktopOnly}>
                <a
                  href={viewAll.href}
                  {...(viewAll.external && { target: "_blank", rel: "noreferrer" })}
                >
                  {content.viewAllLabel}
                </a>
              </li>
            </ul>
          </div>
          <div data-anim="group" className={styles.column}>
            <h2 className={styles.heading}>{content.resourcesHeading}</h2>
            <ul className={styles.list}>
              {content.resources.map((r, i) => {
                const link = resolveLink(r.href, site);
                return (
                  <li key={i}>
                    <a
                      href={link.href}
                      {...(link.download && { download: link.download })}
                      {...(link.external && { target: "_blank", rel: "noreferrer" })}
                    >
                      {r.label}
                      {link.external && <span className="visually-hidden"> (opens in a new tab)</span>}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        <blockquote data-anim="group" className={styles.quote}>
          <p>{content.quote}</p>
          <span className={styles.ornament} aria-hidden="true" />
        </blockquote>

        <div className={styles.bottom}>
          <span data-anim="rule" className={styles.rule} aria-hidden="true">
            <span className={styles.ruleGlyph}>♧</span>
          </span>
          <p data-anim="legal">{content.copyright}</p>
          <p data-anim="legal">{content.credit}</p>
        </div>
      </div>
    </AnimatedSection>
  );
}
