import { Fragment } from "react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Picture } from "@/components/Picture";
import { Accented } from "@/content/rich";
import type { ExpertiseContent } from "@/content/types";
import styles from "./ExpertiseSection.module.css";

// 04 — Expertise (Figma desktop 11:125, mobile 120:41).
// Timeline in src/animations/expertise.ts (pinned card sequence on desktop).
// The second title line is the smaller sans-serif subline.
export function ExpertiseSection({ content }: { content: ExpertiseContent }) {
  return (
    <AnimatedSection
      id="expertise"
      animation="expertise"
      className={styles.expertise}
      ariaLabelledby="expertise-title"
    >
      <div className={styles.inner}>
        <div className={styles.header}>
          <p data-anim="marker" className={styles.marker}>
            <span className={styles.number}>{content.number}</span>
            {content.marker}
          </p>
          <h2 id="expertise-title" className={styles.title}>
            {content.title.map((line, i) => (
              <Fragment key={i}>
                <span
                  data-anim="mask"
                  className={i === 1 ? `${styles.line} ${styles.subline}` : styles.line}
                >
                  <span>
                    <Accented text={line} />
                  </span>
                </span>
                {i < content.title.length - 1 && " "}
              </Fragment>
            ))}
          </h2>
        </div>

        <ol data-anim="cards" className={styles.cards}>
          {content.cards.map((cap, i) => (
            <li
              key={i}
              data-anim="card"
              className={styles.card}
              data-tone={cap.tone}
            >
              <div data-anim="card-text" className={styles.text}>
                <Picture
                  name={cap.emblem}
                  alt=""
                  sizes="76px"
                  className={styles.emblem}
                  imgClassName={styles.emblemImg}
                />
                <p className={styles.index}>{String(i + 1).padStart(2, "0")}</p>
                <h3 className={styles.cardTitle}>{cap.title}</h3>
                <p className={styles.skills}>
                  {cap.skillsMobile.trim() ? (
                    <>
                      <span className={styles.desktopOnly}>{cap.skills}</span>
                      <span className={styles.mobileOnly}>{cap.skillsMobile}</span>
                    </>
                  ) : (
                    cap.skills
                  )}
                </p>
              </div>
              <div data-anim="card-art" className={styles.artWrap}>
                <Picture
                  name={cap.image}
                  alt={cap.imageAlt}
                  sizes="(min-width: 1024px) 365px, 100vw"
                  className={styles.art}
                  imgClassName={styles.artImg}
                />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </AnimatedSection>
  );
}
