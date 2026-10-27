import { AnimatedSection } from "@/components/AnimatedSection";
import { Picture } from "@/components/Picture";
import { mailtoHref, siteConfig } from "@/lib/site-config";
import styles from "./ContactSection.module.css";

// 08 — Contact / Namaste invitation (Figma desktop 11:197, mobile 120:114).
// Timeline in src/animations/contact.ts. The desktop and mobile frames use
// different headlines and CTA order.
export function ContactSection() {
  return (
    <AnimatedSection
      id="contact"
      animation="contact"
      className={styles.contact}
      ariaLabelledby="contact-title"
    >
      <div data-anim="art" className={styles.artWrap}>
        <Picture
          name="contact"
          alt="Illustration of Rohit typing at a carved wooden desk on a veranda overlooking a temple and lotus pond."
          sizes="(min-width: 1024px) 55vw, 100vw"
          className={styles.art}
          imgClassName={styles.artImg}
        />
      </div>

      <div className={styles.panel}>
        <div data-anim="heading" className={styles.heading}>
          <p className={styles.marker}>
            <span className={styles.number}>08</span>
            <span className={styles.slash} aria-hidden="true">
              /
            </span>
            <span className={styles.desktopOnly}>A personal hello</span>
            <span className={styles.mobileOnly}>Let’s connect</span>
          </p>
          <h2 id="contact-title" className={styles.title}>
            <span className={styles.desktopOnly}>
              Until we meet.
              <span className={styles.subtitle}>Let’s build something meaningful.</span>
            </span>
            <span className={styles.mobileOnly}>Have a meaningful challenge in mind?</span>
          </h2>
        </div>

        <div className={styles.body}>
          <p data-anim="copy" className={`${styles.copy} ${styles.desktopOnly}`}>
            Have a project, an opportunity, or an interesting problem? I’d love to hear what
            you’re working on.
          </p>
          <p data-anim="copy" className={`${styles.copy} ${styles.mobileOnly}`}>
            Let’s build something thoughtful, useful and made to last.
          </p>

          <div className={styles.ctas}>
            <a data-anim="action" href={mailtoHref} className={styles.email}>
              <span className={styles.desktopOnly}>
                <span aria-hidden="true">↗ </span>Send me an email
              </span>
              <span className={styles.mobileOnly}>Get in touch</span>
              <span className="visually-hidden"> ({siteConfig.email})</span>
            </a>
            <a
              data-anim="action"
              href={siteConfig.resume.href}
              download={siteConfig.resume.downloadName}
              className={styles.resume}
            >
              <span className={styles.desktopOnly} aria-hidden="true">
                ↓{" "}
              </span>
              Download résumé
              <span className="visually-hidden"> (PDF)</span>
            </a>
          </div>

          <p data-anim="signoff" className={styles.sign}>Thoughtful engineering. Human connection.</p>
          <p data-anim="signoff" className={styles.namaste}>Namaste</p>
        </div>
      </div>
    </AnimatedSection>
  );
}
