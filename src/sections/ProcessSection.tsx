import { AnimatedSection } from "@/components/AnimatedSection";
import { Picture } from "@/components/Picture";
import type { ImageName } from "@/lib/images.generated";
import styles from "./ProcessSection.module.css";

const steps: { title: string; body: string; art: ImageName; artAlt: string }[] = [
  {
    title: "Understand",
    body: "Align on goals, users and the real problem.",
    art: "process-1",
    artAlt: "A winding river path through green hills.",
  },
  {
    title: "Explore",
    body: "Explore the options, trade-offs and best route.",
    art: "process-2",
    artAlt: "An architectural sketch of a temple complex.",
  },
  {
    title: "Build",
    body: "Build with craft, clarity and performance in mind.",
    art: "process-3",
    artAlt: "Carved stone and textile patterns laid side by side.",
  },
  {
    title: "Refine",
    body: "Test, learn, measure and make it better.",
    art: "process-4",
    artAlt: "Ripples spreading across a lotus pond.",
  },
];

// 06 — Process (Figma desktop 11:166, mobile 120:83).
// Timeline in src/animations/process.ts. Scrolls naturally (never pinned).
export function ProcessSection() {
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
            <span className={styles.number}>06</span>A thoughtful way of working
          </p>
          <h2 id="process-title" className={styles.title}>
            <span data-anim="mask">
              <span>A clear path from question to impact.</span>
            </span>
          </h2>
        </div>

        <div className={styles.journey}>
          <span data-anim="route" className={styles.route} aria-hidden="true" />
          <ol data-anim="steps" className={styles.steps}>
            {steps.map((step, i) => (
              <li
                key={step.title}
                data-anim="step"
                className={styles.step}
              >
                <span data-anim="seal" className={styles.seal}>0{i + 1}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.body}>{step.body}</p>
                <Picture
                  name={step.art}
                  alt={step.artAlt}
                  sizes="(min-width: 1024px) 224px, 100vw"
                  className={styles.art}
                  imgClassName={styles.artImg}
                />
              </li>
            ))}
          </ol>
        </div>

        <p data-anim="note" className={styles.note}>
          Clear thinking. Considered craft. Continuous improvement.
        </p>
      </div>
    </AnimatedSection>
  );
}
