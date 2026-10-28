import { AnimatedSection } from "@/components/AnimatedSection";
import { Picture } from "@/components/Picture";
import type { ProcessContent } from "@/content/types";
import styles from "./ProcessSection.module.css";

// 06 — Process (Figma desktop 11:166, mobile 120:83).
// Timeline in src/animations/process.ts. Scrolls naturally (never pinned).
export function ProcessSection({ content }: { content: ProcessContent }) {
  return (
    <AnimatedSection
      id="process"
      animation="process"
      className={styles.process}
      ariaLabelledby="process-title"
    >
      <div className={styles.inner}>
        <div className={styles.header}>
          <p data-anim="marker" className={styles.marker}>
            <span className={styles.number}>{content.number}</span>
            {content.marker}
          </p>
          <h2 id="process-title" className={styles.title}>
            <span data-anim="mask">
              <span>{content.title}</span>
            </span>
          </h2>
        </div>

        <div className={styles.journey}>
          <span data-anim="route" className={styles.route} aria-hidden="true" />
          <ol data-anim="steps" className={styles.steps}>
            {content.steps.map((step, i) => (
              <li
                key={i}
                data-anim="step"
                className={styles.step}
              >
                <span data-anim="seal" className={styles.seal}>{String(i + 1).padStart(2, "0")}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.body}>{step.body}</p>
                <Picture
                  name={step.image}
                  alt={step.imageAlt}
                  sizes="(min-width: 1024px) 224px, 100vw"
                  className={styles.art}
                  imgClassName={styles.artImg}
                />
              </li>
            ))}
          </ol>
        </div>

        <p data-anim="note" className={styles.note}>
          {content.note}
        </p>
      </div>
    </AnimatedSection>
  );
}
