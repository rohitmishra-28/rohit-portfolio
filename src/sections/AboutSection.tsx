import { Fragment } from "react";
import { asset } from "@/lib/base-path";
import { AnimatedSection } from "@/components/AnimatedSection";
import { ArrowIcon } from "@/components/ArrowIcon";
import { Picture } from "@/components/Picture";
import { resolveLink } from "@/content/links";
import { Accented, orDesktop } from "@/content/rich";
import type { AboutContent, SiteContent } from "@/content/types";
import styles from "./AboutSection.module.css";

// 02 — About (Figma desktop 11:72, mobile 120:14).
// Timeline in src/animations/about.ts. A highlight's `title` is the desktop
// copy; `short` is the mobile frame's wording.
export function AboutSection({ content, site }: { content: AboutContent; site: SiteContent }) {
  const cta = resolveLink(content.cta.href, site);

  return (
    <AnimatedSection
      id="about"
      animation="about"
      className={styles.about}
      ariaLabelledby="about-title"
    >
      <div data-anim="art" className={styles.artWrap}>
        <Picture
          name={content.image}
          alt={content.imageAlt}
          sizes="(min-width: 1024px) 100vw, 100vw"
          className={styles.art}
          imgClassName={styles.artImg}
        />
      </div>

      <div data-anim="column" className={styles.column}>
        <div className={styles.heading}>
          <p data-anim="marker" className={styles.marker}>
            <span className={styles.number}>{content.number}</span>
            <span className={styles.slash} aria-hidden="true">
              /
            </span>
            {content.marker}
          </p>
          <h2 id="about-title" className={styles.title}>
            {content.title.map((line, i) => (
              <Fragment key={i}>
                <span data-anim="mask" className={styles.line}>
                  <span>
                    <Accented text={line} className={styles.accent} />
                  </span>
                </span>
                {i < content.title.length - 1 && " "}
              </Fragment>
            ))}
          </h2>
        </div>

        <p data-anim="bio" className={styles.bio}>
          {content.bio}
        </p>

        <ul data-anim="highlights" className={styles.capabilities}>
          {content.highlights.map((cap, i) => (
            <li key={i} data-anim="highlight" className={styles.capability}>
              <span className={styles.icon} aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element -- static SVG glyph */}
                <img src={asset(cap.icon)} alt="" />
              </span>
              <span className={styles.capText}>
                <span className={styles.capLabel}>
                  <span className={styles.capIndex}>{String(i + 1).padStart(2, "0")} — </span>
                  {cap.label}
                  <span className={styles.capSep} aria-hidden="true">
                    {"  ·  "}
                  </span>
                </span>
                <span className={styles.capTitle}>{cap.title}</span>
                <span className={styles.capShort}>{orDesktop(cap.short, cap.title)}</span>
              </span>
            </li>
          ))}
        </ul>

        <a
          data-anim="cta"
          href={cta.href}
          className={styles.cta}
          {...(cta.external && { target: "_blank", rel: "noreferrer" })}
        >
          <span className={styles.circle} aria-hidden="true">
            <ArrowIcon />
          </span>
          {content.cta.label}
          {cta.resume && <span className="visually-hidden"> (résumé PDF)</span>}
          {cta.external && <span className="visually-hidden"> (opens in a new tab)</span>}
        </a>
      </div>
    </AnimatedSection>
  );
}
