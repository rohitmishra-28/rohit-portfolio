import { AnimatedSection } from "@/components/AnimatedSection";
import { ArrowIcon } from "@/components/ArrowIcon";
import { Picture } from "@/components/Picture";
import styles from "./HeroSection.module.css";

// 01 — Hero (Figma desktop 11:46, mobile 120:2).
// Load timeline and Hero → About parallax in src/animations/hero.ts; the CTA
// swap and bouncing scroll cue are CSS loops in the module stylesheet.
export function HeroSection() {
  return (
    <AnimatedSection
      id="top"
      animation="hero"
      className={styles.hero}
      ariaLabelledby="hero-title"
    >
      <div data-anim="art" className={styles.artWrap}>
        <Picture
          name="hero"
          desktopName="hero-desktop"
          alt="Illustration of a developer working on a laptop beneath a banyan tree, beside a lotus lake and a South Indian temple at sunset."
          sizes="100vw"
          priority
          className={styles.art}
          imgClassName={styles.artImg}
        />
      </div>

      <div data-anim="content" className={styles.content}>
        <p data-anim="eyebrow" data-hero-anim className={styles.eyebrow}>
          Frontend developer
        </p>
        <h1 id="hero-title" data-anim="title" data-hero-anim className={styles.title}>
          <span data-anim="line" className={styles.line}>
            Building{" "}
          </span>
          <span data-anim="line" className={`${styles.line} ${styles.accent}`}>
            digital experiences{" "}
          </span>
          <span data-anim="line" className={styles.line}>
            with purpose.
          </span>
        </h1>
        <span data-anim="divider" data-hero-anim className={styles.divider} aria-hidden="true" />
        <p data-anim="lede" data-hero-anim className={styles.lede}>
          I craft performant, accessible and thoughtful digital experiences that help ecommerce
          brands grow.
        </p>
        <div data-anim="ctas" data-hero-anim className={styles.ctas}>
          <a href="#work" className={styles.primary}>
            <CircleArrow />
            <span className={styles.label}>Explore work</span>
          </a>
          <a href="#about" className={styles.secondary}>
            <CircleArrow />
            <span className={styles.label}>About me</span>{" "}
            <span className={styles.secondaryArrow} aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      {/* Outer element fades with scroll; inner one runs the load entrance. */}
      <div data-anim="scroll-cue" className={styles.scroll} aria-hidden="true">
        <div data-anim="scroll" data-hero-anim className={styles.scrollInner}>
          <span className={styles.scrollLine} />
          <span>Scroll</span>
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
