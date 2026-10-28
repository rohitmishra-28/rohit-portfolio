import { AnimatedSection } from "@/components/AnimatedSection";
import { ArrowIcon } from "@/components/ArrowIcon";
import { Picture } from "@/components/Picture";
import { ctaLinks } from "@/lib/site-config";
import styles from "./AboutSection.module.css";

// `title` is the desktop copy; `short` is the mobile frame's wording.
const capabilities = [
  {
    label: "11+ years",
    title: "Frontend Development Experience",
    short: "Frontend development experience",
  },
  {
    label: "Shopify & ecommerce",
    title: "Storefronts, Themes and Custom Features",
    short: "Storefronts, themes and custom features",
  },
  {
    label: "Performance focus",
    title: "Core Web Vitals and Technical SEO",
    short: "Core Web Vitals and technical SEO",
  },
  {
    label: "Collaborative approach",
    title: "Work with Design, Product and Marketing Teams",
    short: "Design, product and marketing teams",
  },
];

// 02 — About (Figma desktop 11:72, mobile 120:14).
// Timeline in src/animations/about.ts.
export function AboutSection() {
  return (
    <AnimatedSection
      id="about"
      animation="about"
      className={styles.about}
      ariaLabelledby="about-title"
    >
      <div data-anim="art" className={styles.artWrap}>
        <Picture
          name="about"
          alt="Illustration of Rohit at a wooden desk with a monitor and laptop, in a room with temple sketches, plants and a sleeping cat."
          sizes="(min-width: 1024px) 100vw, 100vw"
          className={styles.art}
          imgClassName={styles.artImg}
        />
      </div>

      <div data-anim="column" className={styles.column}>
        <div className={styles.heading}>
          <p data-anim="marker" className={styles.marker}>
            <span className={styles.number}>01</span>
            <span className={styles.slash} aria-hidden="true">
              /
            </span>
            About me
          </p>
          <h2 id="about-title" className={styles.title}>
            <span data-anim="mask" className={styles.line}>
              <span>A developer with</span>
            </span>{" "}
            <span data-anim="mask" className={styles.line}>
              <span>
                <span className={styles.accent}>Indian roots</span> and
              </span>
            </span>{" "}
            <span data-anim="mask" className={styles.line}>
              <span>global vision.</span>
            </span>
          </h2>
        </div>

        <p data-anim="bio" className={styles.bio}>
          I’m Rohit Mishra, a frontend developer passionate about crafting digital experiences
          that are meaningful, accessible and beautiful. I bring together engineering precision,
          ecommerce expertise and a deep appreciation for visual storytelling.
        </p>

        <ul data-anim="highlights" className={styles.capabilities}>
          {capabilities.map((cap, i) => (
            <li key={cap.label} data-anim="highlight" className={styles.capability}>
              <span className={styles.icon} aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element -- static SVG glyph */}
                <img src={`/images/icons/about-cap-${i + 1}.svg`} alt="" />
              </span>
              <span className={styles.capText}>
                <span className={styles.capLabel}>
                  <span className={styles.capIndex}>0{i + 1} — </span>
                  {cap.label}
                  <span className={styles.capSep} aria-hidden="true">
                    {"  ·  "}
                  </span>
                </span>
                <span className={styles.capTitle}>{cap.title}</span>
                <span className={styles.capShort}>{cap.short}</span>
              </span>
            </li>
          ))}
        </ul>

        <a data-anim="cta" href={ctaLinks.moreAboutMe} className={styles.cta}>
          <span className={styles.circle} aria-hidden="true">
            <ArrowIcon />
          </span>
          More about me
          <span className="visually-hidden"> (résumé PDF)</span>
        </a>
      </div>
    </AnimatedSection>
  );
}
