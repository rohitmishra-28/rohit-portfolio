import { Fragment } from "react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Picture } from "@/components/Picture";
import { Accented, orDesktop, wholeAccent } from "@/content/rich";
import type { PhilosophyContent } from "@/content/types";
import styles from "./EngineeringPhilosophySection.module.css";

// 05 — Engineering Philosophy (Figma desktop 11:148, mobile 120:65).
// Timeline in src/animations/philosophy.ts. A principle's `body` is the
// desktop copy; `short` is the mobile frame's.
export function EngineeringPhilosophySection({ content }: { content: PhilosophyContent }) {
  return (
    <AnimatedSection
      id="philosophy"
      animation="philosophy"
      className={styles.philosophy}
      ariaLabelledby="philosophy-title"
    >
      <div data-anim="art" className={styles.art}>
        <Picture
          name={content.image}
          alt=""
          sizes="(min-width: 1024px) 55vw, 100vw"
          className={styles.artPic}
          imgClassName={styles.artImg}
        />
      </div>

      <div className={styles.inner}>
        <p data-anim="marker" className={styles.marker}>
          <span className={styles.number}>{content.number}</span>
          <span className={styles.slash} aria-hidden="true">
            /
          </span>
          {content.marker}
        </p>
        <h2 id="philosophy-title" className={styles.title}>
          {content.title.map((line, i) => {
            // A fully highlighted line takes the larger accent styling.
            const whole = wholeAccent(line);
            return (
              <Fragment key={i}>
                <span
                  data-anim="mask"
                  className={whole ? `${styles.line} ${styles.accent}` : styles.line}
                >
                  <span>{whole ?? <Accented text={line} className={styles.accent} />}</span>
                </span>
                {i < content.title.length - 1 && " "}
              </Fragment>
            );
          })}
        </h2>
        <p data-anim="statement" className={`${styles.statement} ${styles.desktopOnly}`}>
          {content.statement}
        </p>
        <p data-anim="statement" className={`${styles.statement} ${styles.mobileOnly}`}>
          {orDesktop(content.statementMobile, content.statement)}
        </p>

        <ul data-anim="principles" className={styles.principles}>
          {content.principles.map((p, i) => (
            <li key={i} data-anim="principle" className={styles.principle}>
              <span data-anim="rule" className={styles.rule} aria-hidden="true" />
              <span data-anim="glyph" className={styles.glyph} aria-hidden="true">
                {p.glyph}
              </span>
              <h3 className={styles.principleTitle}>{p.title}</h3>
              <p className={styles.tagline}>{p.tagline}</p>
              <p className={`${styles.body} ${styles.desktopOnly}`}>
                {p.body}
              </p>
              <p className={`${styles.body} ${styles.mobileOnly}`}>{orDesktop(p.short, p.body)}</p>
            </li>
          ))}
        </ul>
      </div>
    </AnimatedSection>
  );
}
