import { Picture } from "@/components/Picture";
import { SectionReveal } from "@/components/SectionReveal";
import styles from "./EngineeringPhilosophySection.module.css";

// `body` is the desktop copy; `short` is the mobile frame's.
const principles = [
  {
    glyph: "♧",
    title: "Performance",
    tagline: "Fast. Thoughtful. Purposeful.",
    body: "Optimize for speed, Core Web Vitals and real user experience — not just lab scores.",
    short: "Optimize for speed, Core Web Vitals and real user experience.",
  },
  {
    glyph: "✿",
    title: "Accessibility",
    tagline: "For everyone. By design.",
    body: "Build experiences that are inclusive, usable and work for more people, across devices and contexts.",
    short: "Build inclusive experiences across devices and contexts.",
  },
  {
    glyph: "♧",
    title: "Maintainability",
    tagline: "Built to last.",
    body: "Write clean, modular code and scalable systems that support long-term growth.",
    short: "Write clean, modular code and scalable systems.",
  },
];

// 05 — Engineering Philosophy (Figma desktop 11:148, mobile 120:65).
// Dark background stays put; statement lines stagger ~70ms; principles
// slide in one after another (left from the left, right from the right).
export function EngineeringPhilosophySection() {
  return (
    <SectionReveal
      id="philosophy"
      className={styles.philosophy}
      ariaLabelledby="philosophy-title"
      distance={24}
      duration={600}
      stagger={70}
    >
      <Picture
        name="philosophy"
        alt=""
        sizes="(min-width: 1024px) 55vw, 100vw"
        className={styles.art}
        imgClassName={styles.artImg}
      />

      <div className={styles.inner}>
        <p data-reveal className={styles.marker}>
          <span className={styles.number}>05</span>
          <span className={styles.slash} aria-hidden="true">
            /
          </span>
          Engineering philosophy
        </p>
        <h2 id="philosophy-title" className={styles.title}>
          <span data-reveal className={styles.line}>
            Good engineering
          </span>{" "}
          <span data-reveal className={`${styles.line} ${styles.accent}`}>
            is felt, not just seen.
          </span>
        </h2>
        <p data-reveal className={`${styles.statement} ${styles.desktopOnly}`}>
          I believe technology should be invisible, intuitive and human. Performance,
          accessibility and maintainability are not checkboxes — they are part of a better, more
          inclusive web.
        </p>
        <p data-reveal className={`${styles.statement} ${styles.mobileOnly}`}>
          Technology should feel invisible, intuitive and human—built for performance,
          accessibility and maintainability.
        </p>

        <ul className={styles.principles} data-reveal-group="180">
          {principles.map((p) => (
            <li key={p.title} data-reveal="slide" className={styles.principle}>
              <span className={styles.glyph} aria-hidden="true">
                {p.glyph}
              </span>
              <h3 className={styles.principleTitle}>{p.title}</h3>
              <p className={styles.tagline}>{p.tagline}</p>
              <p className={`${styles.body} ${styles.desktopOnly}`}>
                {p.body}
              </p>
              <p className={`${styles.body} ${styles.mobileOnly}`}>{p.short}</p>
            </li>
          ))}
        </ul>
      </div>
    </SectionReveal>
  );
}
