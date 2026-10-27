import { Picture } from "@/components/Picture";
import styles from "./HeroSection.module.css";

// 01 — Hero (Figma desktop 11:46, mobile 120:2).
// Not wrapped in SectionReveal: content animates on first render via CSS
// keyframes and never waits on an observer.
export function HeroSection() {
  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <Picture
        name="hero"
        alt="Illustration of a developer working on a laptop beneath a banyan tree, beside a lotus lake and a South Indian temple at sunset."
        sizes="100vw"
        priority
        className={styles.art}
        imgClassName={styles.artImg}
      />

      <div className={styles.content}>
        <p className={styles.eyebrow}>Frontend developer</p>
        <h1 id="hero-title" className={styles.title}>
          <span className={styles.line}>Building </span>
          <span className={`${styles.line} ${styles.accent}`}>digital experiences </span>
          <span className={styles.line}>with purpose.</span>
        </h1>
        <span className={styles.divider} aria-hidden="true" />
        <p className={styles.lede}>
          I craft performant, accessible and thoughtful digital experiences that help ecommerce
          brands grow.
        </p>
        <div className={styles.ctas}>
          <a href="#work" className={styles.primary}>
            <span className={styles.circle} aria-hidden="true">
              →
            </span>
            Explore work
          </a>
          <a href="#about" className={styles.secondary}>
            About me <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <div className={styles.scroll} aria-hidden="true">
        <span className={styles.scrollLine} />
        Scroll
      </div>
    </section>
  );
}
