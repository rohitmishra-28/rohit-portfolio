import { Picture } from "@/components/Picture";
import { SectionReveal } from "@/components/SectionReveal";
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
// Headline rises; illustration fades over ~500ms; bio follows; the four
// highlights then slide in one after another — left column from the left,
// right column from the right.
export function AboutSection() {
  return (
    <SectionReveal
      id="about"
      className={styles.about}
      ariaLabelledby="about-title"
      distance={24}
      duration={600}
      stagger={70}
    >
      <div data-reveal="fade" data-reveal-duration="500" className={styles.artWrap}>
        <Picture
          name="about"
          alt="Illustration of Rohit at a wooden desk with a monitor and laptop, in a room with temple sketches, plants and a sleeping cat."
          sizes="(min-width: 1024px) 100vw, 100vw"
          className={styles.art}
          imgClassName={styles.artImg}
        />
      </div>

      <div className={styles.column}>
        <div data-reveal className={styles.heading}>
          <p className={styles.marker}>
            <span className={styles.number}>01</span>
            <span className={styles.slash} aria-hidden="true">
              /
            </span>
            About me
          </p>
          <h2 id="about-title" className={styles.title}>
            <span className={styles.line}>A developer with</span>{" "}
            <span className={styles.line}>
              <span className={styles.accent}>Indian roots</span> and
            </span>{" "}
            <span className={styles.line}>global vision.</span>
          </h2>
        </div>

        <p data-reveal className={styles.bio}>
          I’m Rohit Mishra, a frontend developer passionate about crafting digital experiences
          that are meaningful, accessible and beautiful. I bring together engineering precision,
          ecommerce expertise and a deep appreciation for visual storytelling.
        </p>

        <ul className={styles.capabilities} data-reveal-group="160">
          {capabilities.map((cap, i) => (
            <li key={cap.label} data-reveal="slide" className={styles.capability}>
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

        <a data-reveal href={ctaLinks.moreAboutMe} className={styles.cta}>
          <span className={styles.circle} aria-hidden="true">
            →
          </span>
          More about me
          <span className="visually-hidden"> (résumé PDF)</span>
        </a>
      </div>
    </SectionReveal>
  );
}
