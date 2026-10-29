import { Fragment } from "react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Picture } from "@/components/Picture";
import type { JourneyContent } from "@/content/types";
import { Accented, orDesktop } from "@/content/rich";
import styles from "./JourneySection.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

// 03 — Journey (Figma desktop 198:32, mobile 204:32, concept 209:32).
// Timeline in src/animations/journey.ts: the section pins, the figure and
// background stay put, and each scroll step swaps the chapter — the card on
// the right and the label and dates around the figure.
//
// Without motion (reduced motion, no JS, CMS preview) the chapters are a
// plain list: the figure sits beside the first one. While pinned, the
// chapters overlap in one grid cell; the figure and the scroll hint belong to
// the first chapter, whose card frame stays put while only the contents
// (data-anim="lead", "when" and "card") change.
export function JourneySection({ content }: { content: JourneyContent }) {
  const total = pad(content.chapters.length);

  return (
    <AnimatedSection id="journey" animation="journey" className={styles.journey} ariaLabelledby="journey-title">
      <Picture
        name={content.background}
        alt=""
        sizes="100vw"
        className={styles.background}
        imgClassName={styles.backgroundImg}
      />

      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>{content.eyebrow}</p>
          <h2 id="journey-title" className={styles.title}>
            {content.title.map((line, i) => (
              <Fragment key={i}>
                {i > 0 && " "}
                <span className={styles.line}>
                  <Accented text={line} className={styles.accent} />
                </span>
              </Fragment>
            ))}
          </h2>
          <p className={styles.intro}>
            <span className={styles.desktopOnly}>{content.intro}</span>
            <span className={styles.mobileOnly}>{orDesktop(content.introMobile, content.intro)}</span>
          </p>
        </header>

        <div className={styles.stage} data-anim="stage">
          <ol className={styles.chapters}>
            {content.chapters.map((chapter, i) => {
              const last = i === content.chapters.length - 1;
              return (
                <li key={i} className={styles.chapter} data-anim="chapter">
                  <div className={styles.meta}>
                    <div data-anim="lead" className={styles.lead}>
                      <p className={styles.label}>{chapter.label}</p>
                      <p className={styles.tagline}>{chapter.tagline}</p>
                    </div>
                    <div className={styles.figureSlot}>
                      {i === 0 && (
                        <Picture
                          name={content.figure}
                          alt={content.figureAlt}
                          sizes="(min-width: 1024px) 228px, 136px"
                          className={styles.figure}
                          imgClassName={styles.figureImg}
                        />
                      )}
                    </div>
                    <div data-anim="when" className={styles.when}>
                      <span className={styles.node} aria-hidden="true" />
                      <p className={styles.dates}>{chapter.dates}</p>
                      <p className={styles.location}>{chapter.location}</p>
                      <span className={styles.marker} aria-hidden="true" />
                    </div>
                  </div>

                  <div className={styles.card}>
                    <div data-anim="card" className={styles.cardBody}>
                      <p className={styles.counter}>
                        {last ? content.currentLabel : content.chapterLabel}
                        <span aria-hidden="true"> · </span>
                        <span className="visually-hidden">, </span>
                        {pad(i + 1)} / {total}
                      </p>
                      <div className={styles.role}>
                        <div className={styles.logoTile}>
                          {chapter.logo ? (
                            <Picture
                              name={chapter.logo}
                              alt={chapter.badge}
                              sizes="116px"
                              className={styles.logo}
                              imgClassName={styles.logoImg}
                            />
                          ) : (
                            <span className={styles.badge}>{chapter.badge}</span>
                          )}
                        </div>
                        <div className={styles.roleText}>
                          <h3 className={styles.roleTitle}>{chapter.role}</h3>
                          <p className={styles.company}>{chapter.company}</p>
                        </div>
                      </div>
                      <p className={styles.workLabel}>{content.workLabel}</p>
                      <ol className={styles.points}>
                        {chapter.points.map((point, j) => (
                          <li key={j} className={styles.point}>
                            <span className={styles.pointNumber} aria-hidden="true">
                              {pad(j + 1)}
                            </span>
                            <p className={styles.pointTitle}>{point.title}</p>
                            <p className={styles.pointBody}>{point.body}</p>
                          </li>
                        ))}
                      </ol>
                    </div>
                    {i === 0 && (
                      <p data-anim="hint" className={styles.hint} aria-hidden="true">
                        {content.scrollHint} <span className={styles.arrow}>↓</span>
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </AnimatedSection>
  );
}
