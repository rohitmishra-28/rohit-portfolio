import type { CSSProperties } from "react";
import { Picture } from "@/components/Picture";
import { SectionReveal } from "@/components/SectionReveal";
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
// Desktop: the four milestones slide up one after another along the gold
// route, which draws in with scaleX. Mobile: steps slide up and stick, so
// each one stacks on top of the last while scrolling.
export function ProcessSection() {
  return (
    <SectionReveal
      id="process"
      className={styles.process}
      ariaLabelledby="process-title"
      distance={48}
      duration={600}
      stagger={0}
    >
      <div className={styles.inner}>
        <div data-reveal className={styles.header}>
          <p className={styles.marker}>
            <span className={styles.number}>06</span>A thoughtful way of working
          </p>
          <h2 id="process-title" className={styles.title}>
            A clear path from question to impact.
          </h2>
        </div>

        <div className={styles.journey}>
          <span
            data-reveal="line"
            data-reveal-duration="900"
            className={styles.route}
            aria-hidden="true"
          />
          <ol
            className={styles.steps}
            data-reveal-group="160"
            data-reveal-media="(min-width: 1024px)"
          >
            {steps.map((step, i) => (
              <li
                key={step.title}
                data-reveal
                className={styles.step}
                style={{ "--i": i } as CSSProperties}
              >
                <span className={styles.seal}>0{i + 1}</span>
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

        <p data-reveal className={styles.note}>
          Clear thinking. Considered craft. Continuous improvement.
        </p>
      </div>
    </SectionReveal>
  );
}
