import { Picture } from "@/components/Picture";
import { SectionReveal } from "@/components/SectionReveal";
import styles from "./HeritageSignatureSection.module.css";

// 07 — Heritage to Digital Signature (Figma desktop 11:191, mobile 120:108).
// The art crossfades in over ~500ms; the headline rises 10px. The mobile frame
// uses a solid dark veil, so the art is desktop-only.
export function HeritageSignatureSection() {
  return (
    <SectionReveal
      id="signature"
      className={styles.signature}
      ariaLabelledby="signature-title"
      distance={10}
      duration={420}
      stagger={80}
    >
      <div data-reveal="fade" data-reveal-duration="500" className={styles.artWrap}>
        <Picture
          name="signature"
          alt=""
          sizes="100vw"
          className={styles.art}
          imgClassName={styles.artImg}
        />
      </div>

      <div className={styles.inner}>
        <p data-reveal className={styles.eyebrow}>
          <span className={styles.eyebrowLine}>Rooted in heritage.</span>{" "}
          <span className={styles.eyebrowLine}>Built for what’s next.</span>
        </p>
        <h2 data-reveal id="signature-title" className={styles.title}>
          <span className={styles.line}>Tradition inspires the craft.</span>{" "}
          <span className={styles.line}>Technology carries it forward.</span>
        </h2>
        <p data-reveal className={`${styles.body} ${styles.desktopOnly}`}>
          A personal practice grounded in curiosity, cultural appreciation and thoughtful
          engineering.
        </p>
        <p data-reveal className={`${styles.body} ${styles.mobileOnly}`}>
          A practice grounded in curiosity, cultural appreciation and thoughtful engineering.
        </p>
      </div>
    </SectionReveal>
  );
}
