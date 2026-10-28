import { Fragment } from "react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Picture } from "@/components/Picture";
import { Accented, orDesktop } from "@/content/rich";
import type { SignatureContent } from "@/content/types";
import styles from "./HeritageSignatureSection.module.css";

// 07 — Heritage to Digital Signature (Figma desktop 11:191, mobile 120:108).
// Timeline in src/animations/signature.ts. The mobile frame uses a solid
// dark veil, so the art is desktop-only.
export function HeritageSignatureSection({ content }: { content: SignatureContent }) {
  return (
    <AnimatedSection
      id="signature"
      animation="signature"
      className={styles.signature}
      ariaLabelledby="signature-title"
    >
      <div data-anim="art" className={styles.artWrap}>
        <Picture
          name={content.image}
          alt=""
          sizes="100vw"
          className={styles.art}
          imgClassName={styles.artImg}
        />
      </div>

      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          {content.eyebrow.map((line, i) => (
            <Fragment key={i}>
              <span data-anim="eyebrow" className={styles.eyebrowLine}>
                {line}
              </span>
              {i < content.eyebrow.length - 1 && " "}
            </Fragment>
          ))}
        </p>
        <h2 id="signature-title" className={styles.title}>
          {content.title.map((line, i) => (
            <Fragment key={i}>
              <span data-anim="mask" className={styles.line}>
                <span>
                  <Accented text={line} />
                </span>
              </span>
              {i < content.title.length - 1 && " "}
            </Fragment>
          ))}
        </h2>
        <p data-anim="body" className={`${styles.body} ${styles.desktopOnly}`}>
          {content.body}
        </p>
        <p data-anim="body" className={`${styles.body} ${styles.mobileOnly}`}>
          {orDesktop(content.bodyMobile, content.body)}
        </p>
      </div>
    </AnimatedSection>
  );
}
