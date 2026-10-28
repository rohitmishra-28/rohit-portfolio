import { asset } from "@/lib/base-path";
import { AnimatedSection } from "@/components/AnimatedSection";
import { LoopVideo } from "@/components/LoopVideo";
import { mailtoHref, resolveLink } from "@/content/links";
import { orDesktop } from "@/content/rich";
import type { ContactContent, SiteContent } from "@/content/types";
import styles from "./ContactSection.module.css";

// 08 — Contact / Namaste invitation (Figma desktop 11:197, mobile 120:114).
// Timeline in src/animations/contact.ts. The desktop and mobile frames use
// different headlines and CTA order.
export function ContactSection({ content, site }: { content: ContactContent; site: SiteContent }) {
  const resume = resolveLink("site:resume", site);

  return (
    <AnimatedSection
      id="contact"
      animation="contact"
      className={styles.contact}
      ariaLabelledby="contact-title"
    >
      <div data-anim="art" className={styles.artWrap}>
        <div className={styles.art}>
          <LoopVideo
            src={asset(content.video)}
            poster={asset(content.videoPoster)}
            label={content.videoLabel}
            width={1280}
            height={720}
            className={styles.artImg}
          />
        </div>
      </div>

      <div className={styles.panel}>
        <div data-anim="heading" className={styles.heading}>
          <p className={styles.marker}>
            <span className={styles.number}>{content.number}</span>
            <span className={styles.slash} aria-hidden="true">
              /
            </span>
            <span className={styles.desktopOnly}>{content.marker}</span>
            <span className={styles.mobileOnly}>{orDesktop(content.markerMobile, content.marker)}</span>
          </p>
          <h2 id="contact-title" className={styles.title}>
            <span className={styles.desktopOnly}>
              {content.title}
              <span className={styles.subtitle}>{content.subtitle}</span>
            </span>
            <span className={styles.mobileOnly}>{orDesktop(content.titleMobile, content.title)}</span>
          </h2>
        </div>

        <div className={styles.body}>
          <p data-anim="copy" className={`${styles.copy} ${styles.desktopOnly}`}>
            {content.copy}
          </p>
          <p data-anim="copy" className={`${styles.copy} ${styles.mobileOnly}`}>
            {orDesktop(content.copyMobile, content.copy)}
          </p>

          <div className={styles.ctas}>
            <a data-anim="action" href={mailtoHref(site)} className={styles.email}>
              <span className={styles.desktopOnly}>
                <span aria-hidden="true">↗ </span>
                {content.emailLabel}
              </span>
              <span className={styles.mobileOnly}>{orDesktop(content.emailLabelMobile, content.emailLabel)}</span>
              <span className="visually-hidden"> ({site.email})</span>
            </a>
            <a
              data-anim="action"
              href={resume.href}
              download={resume.download}
              className={styles.resume}
            >
              <span className={styles.desktopOnly} aria-hidden="true">
                ↓{" "}
              </span>
              {content.resumeLabel}
              <span className="visually-hidden"> (PDF)</span>
            </a>
          </div>

          <p data-anim="signoff" className={styles.sign}>{content.signoff}</p>
          <p data-anim="signoff" className={styles.namaste}>{content.namaste}</p>
        </div>
      </div>
    </AnimatedSection>
  );
}
