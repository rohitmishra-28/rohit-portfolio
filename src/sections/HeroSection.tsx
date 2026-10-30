import { AnimatedSection } from "@/components/AnimatedSection";
import { ArrowIcon } from "@/components/ArrowIcon";
import { Picture } from "@/components/Picture";
import { resolveLink } from "@/content/links";
import { Accented, wholeAccent } from "@/content/rich";
import type { HeroContent, SiteContent } from "@/content/types";
import styles from "./HeroSection.module.css";

// 01 — Hero (Figma desktop 11:46, mobile 120:2).
// Load timeline and Hero → About parallax in src/animations/hero.ts; the CTA
// swap and bouncing scroll cue are CSS loops in the module stylesheet.
export function HeroSection({ content, site }: { content: HeroContent; site: SiteContent }) {
  const primary = resolveLink(content.primaryCta.href, site);
  const secondary = resolveLink(content.secondaryCta.href, site);

  return (
    <AnimatedSection
      id="top"
      animation="hero"
      className={styles.hero}
      ariaLabelledby="hero-title"
    >
      <div data-anim="art" className={styles.artWrap}>
        <Picture
          name={content.image}
          desktopName={content.imageDesktop}
          alt={content.imageAlt}
          sizes="100vw"
          priority
          className={styles.art}
          imgClassName={styles.artImg}
        />
      </div>

      <div data-anim="content" className={styles.content}>
        {/* One H1 holds the eyebrow (name and role, for search engines) and
            the headline; each keeps its own look and entrance. */}
        <h1 id="hero-title" className={styles.heading}>
          <span data-anim="eyebrow" data-hero-anim className={styles.eyebrow}>
            {content.eyebrow}
          </span>{" "}
          <span data-anim="title" data-hero-anim className={styles.title}>
            {content.title.map((line, i) => {
              const whole = wholeAccent(line);
              return (
                <span
                  key={i}
                  data-anim="line"
                  className={whole ? `${styles.line} ${styles.accent}` : styles.line}
                >
                  {whole ?? <Accented text={line} className={styles.accent} />}
                  {i < content.title.length - 1 && " "}
                </span>
              );
            })}
          </span>
        </h1>
        <span data-anim="divider" data-hero-anim className={styles.divider} aria-hidden="true" />
        <p data-anim="lede" data-hero-anim className={styles.lede}>
          {content.lede}
        </p>
        <div data-anim="ctas" data-hero-anim className={styles.ctas}>
          <a
            href={primary.href}
            className={styles.primary}
            {...(primary.download && { download: primary.download })}
            {...(primary.external && { target: "_blank", rel: "noreferrer" })}
          >
            <CircleArrow />
            <span className={styles.label}>{content.primaryCta.label}</span>
          </a>
          <a
            href={secondary.href}
            className={styles.secondary}
            {...(secondary.download && { download: secondary.download })}
            {...(secondary.external && { target: "_blank", rel: "noreferrer" })}
          >
            <CircleArrow />
            <span className={styles.label}>{content.secondaryCta.label}</span>{" "}
            <span className={styles.secondaryArrow} aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      {/* Outer element fades with scroll; inner one runs the load entrance. */}
      <div data-anim="scroll-cue" className={styles.scroll} aria-hidden="true">
        <div data-anim="scroll" data-hero-anim className={styles.scrollInner}>
          <span className={styles.scrollLine} />
          <span>{content.scrollLabel}</span>
        </div>
      </div>
    </AnimatedSection>
  );
}

function CircleArrow() {
  return (
    <span className={styles.circle} aria-hidden="true">
      <ArrowIcon />
    </span>
  );
}
