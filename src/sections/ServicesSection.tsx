import { Fragment } from "react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { ArrowIcon } from "@/components/ArrowIcon";
import { Picture } from "@/components/Picture";
import { resolveLink } from "@/content/links";
import { Accented } from "@/content/rich";
import type { ServicesContent, SiteContent } from "@/content/types";
import styles from "./ServicesSection.module.css";

const pad = (n: number) => String(n).padStart(2, "0");
const items = (value: string) =>
  value
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);

// 03 — Services (Figma desktop 11:125, scroll states 246:80).
// Timeline in src/animations/services.ts: on desktop the stage pins and the
// scroll steps through the services. Without the pin (phones, short windows,
// reduced motion) the services are a plain list and the side navigation
// links jump to each one.
export function ServicesSection({ content, site }: { content: ServicesContent; site: SiteContent }) {
  const total = pad(content.services.length);
  const button = resolveLink(content.cta.button.href, site);

  return (
    <AnimatedSection
      id="services"
      animation="services"
      className={styles.services}
      ariaLabelledby="services-title"
    >
      <div data-anim="stage" className={styles.stage}>
        <div className={styles.intro}>
          <p data-anim="marker" className={styles.marker}>
            <span className={styles.number}>{content.number}</span>
            {content.marker}
          </p>
          <h2 id="services-title" className={styles.title}>
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
          <p data-anim="lede" className={styles.lede}>
            {content.intro}
          </p>

          <nav data-anim="nav" className={styles.nav} aria-label={content.marker}>
            <ol>
              {content.services.map((s, i) => (
                <li key={i}>
                  <a href={`#services-${i + 1}`} data-anim="nav-link" className={styles.navLink}>
                    <span className={styles.navNumber}>{pad(i + 1)}</span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <ol data-anim="panels" className={styles.panels}>
          {content.services.map((s, i) => (
            <li key={i} id={`services-${i + 1}`} data-anim="panel" className={styles.panel}>
              <div data-anim="details" className={styles.details}>
                <p className={styles.counter}>
                  <span className={styles.desktopOnly}>
                    {pad(i + 1)} / {total}
                  </span>
                  <span className={styles.mobileOnly}>
                    {pad(i + 1)} / {s.label}
                  </span>
                </p>
                <h3 className={styles.serviceTitle}>{s.title}</h3>
                <p className={styles.description}>{s.description}</p>
                <p className={styles.includesLabel}>{content.includesLabel}</p>
                <ul className={styles.includes}>
                  {items(s.includes).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <figure data-anim="media" className={styles.media}>
                <div className={styles.frame}>
                  <Picture
                    name={s.image}
                    alt={s.imageAlt}
                    sizes="(min-width: 1024px) 476px, 100vw"
                    className={styles.picture}
                    imgClassName={styles.img}
                  />
                </div>
                <figcaption className={styles.caption}>
                  {s.caption} <span aria-hidden="true">/</span> {pad(i + 1)}
                </figcaption>
              </figure>
            </li>
          ))}
        </ol>

        <div data-anim="progress" className={styles.progress} aria-hidden="true">
          <p className={styles.hint}>{content.scrollHint}</p>
          <div className={styles.rail}>
            <span data-anim="fill" className={styles.fill} />
            {content.services.map((_, i) => (
              <span
                key={i}
                data-anim="step"
                className={styles.step}
                style={{ left: `${(i / Math.max(1, content.services.length - 1)) * 100}%` }}
              >
                <span className={styles.dot} />
                <span className={styles.stepNumber}>{pad(i + 1)}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div data-anim="cta" className={styles.cta}>
        <div className={styles.ctaText}>
          <p className={styles.ctaEyebrow}>{content.cta.eyebrow}</p>
          <h3 className={styles.ctaTitle}>
            {content.cta.title.map((line, i) => (
              <Fragment key={i}>
                <span className={styles.line}>
                  <Accented text={line} />
                </span>
                {i < content.cta.title.length - 1 && " "}
              </Fragment>
            ))}
          </h3>
          <p className={styles.ctaCopy}>{content.cta.copy}</p>
        </div>
        <a
          href={button.href}
          className={styles.ctaButton}
          {...(button.download && { download: button.download })}
          {...(button.external && { target: "_blank", rel: "noreferrer" })}
        >
          {content.cta.button.label}
          <ArrowIcon size={16} />
        </a>
      </div>
    </AnimatedSection>
  );
}
