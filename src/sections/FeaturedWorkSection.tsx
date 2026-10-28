import { Fragment } from "react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { ArrowIcon } from "@/components/ArrowIcon";
import { Picture } from "@/components/Picture";
import { ProjectCard } from "@/components/ProjectCard";
import { resolveLink } from "@/content/links";
import { Accented, orDesktop, wholeAccent } from "@/content/rich";
import type { SiteContent, WorkContent } from "@/content/types";
import styles from "./FeaturedWorkSection.module.css";

// 03 — Featured Work (Figma desktop 11:85, mobile 120:23).
// Timeline in src/animations/work.ts.
export function FeaturedWorkSection({ content, site }: { content: WorkContent; site: SiteContent }) {
  const cta = resolveLink(content.cta.href, site);

  return (
    <AnimatedSection id="work" animation="work" className={styles.work} ariaLabelledby="work-title">
      <Picture
        name={content.background}
        alt=""
        sizes="100vw"
        className={styles.art}
        imgClassName={styles.artImg}
      />

      <div className={styles.inner}>
        <div className={styles.header}>
          <div>
            <p data-anim="marker" className={styles.marker}>
              <span className={styles.number}>{content.number}</span>
              {content.marker}
            </p>
            <h2 id="work-title" className={styles.title}>
              {content.title.map((line, i) => {
                const whole = wholeAccent(line);
                return (
                  <Fragment key={i}>
                    <span data-anim="mask" className={styles.line}>
                      <span className={whole ? styles.accent : undefined}>
                        {whole ?? <Accented text={line} className={styles.accent} />}
                      </span>
                    </span>
                    {i < content.title.length - 1 && " "}
                  </Fragment>
                );
              })}
            </h2>
            <p data-anim="intro" className={`${styles.intro} ${styles.introDesktop}`}>
              {content.intro}
            </p>
            <p data-anim="intro" className={`${styles.intro} ${styles.introMobile}`}>
              {orDesktop(content.introMobile, content.intro)}
            </p>
          </div>
          <a
            data-anim="cta"
            href={cta.href}
            className={styles.cta}
            {...(cta.download && { download: cta.download })}
            {...(cta.external && { target: "_blank", rel: "noreferrer" })}
          >
            <span className={styles.circle} aria-hidden="true">
              <ArrowIcon size={20} />
            </span>
            {content.cta.label}
          </a>
        </div>

        {/* Focusable so keyboard users can scroll the mobile card row. */}
        <ul
          className={styles.cards}
          aria-label="Featured projects"
          tabIndex={0}
          data-anim="cards"
        >
          {content.projects.map((project, i) => (
            <ProjectCard key={i} project={project} index={i} />
          ))}
        </ul>

        <p data-anim="note" className={styles.note}>
          {content.note}
        </p>
      </div>
    </AnimatedSection>
  );
}
