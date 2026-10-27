import { AnimatedSection } from "@/components/AnimatedSection";
import { Picture } from "@/components/Picture";
import styles from "./HeritageSignatureSection.module.css";

// 07 — Heritage to Digital Signature (Figma desktop 11:191, mobile 120:108).
// Timeline in src/animations/signature.ts. The mobile frame uses a solid
// dark veil, so the art is desktop-only.
export function HeritageSignatureSection() {
  return (
    <AnimatedSection
      id="signature"
      animation="signature"
      className={styles.signature}
      ariaLabelledby="signature-title"
    >
      <div data-anim="art" className={styles.artWrap}>
        <Picture
          name="signature"
          alt=""
          sizes="100vw"
          className={styles.art}
          imgClassName={styles.artImg}
        />
      </div>

      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          <span data-anim="eyebrow" className={styles.eyebrowLine}>
            Rooted in heritage.
          </span>{" "}
          <span data-anim="eyebrow" className={styles.eyebrowLine}>
            Built for what’s next.
          </span>
        </p>
        <h2 id="signature-title" className={styles.title}>
          <span data-anim="mask" className={styles.line}>
            <span>Tradition inspires the craft.</span>
          </span>{" "}
          <span data-anim="mask" className={styles.line}>
            <span>Technology carries it forward.</span>
          </span>
        </h2>
        <p data-anim="body" className={`${styles.body} ${styles.desktopOnly}`}>
          A personal practice grounded in curiosity, cultural appreciation and thoughtful
          engineering.
        </p>
        <p data-anim="body" className={`${styles.body} ${styles.mobileOnly}`}>
          A practice grounded in curiosity, cultural appreciation and thoughtful engineering.
        </p>
      </div>
    </AnimatedSection>
  );
}
