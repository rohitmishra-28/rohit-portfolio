import { Picture } from "@/components/Picture";
import { SectionReveal } from "@/components/SectionReveal";
import type { ImageName } from "@/lib/images.generated";
import styles from "./ExpertiseSection.module.css";

type Capability = {
  title: string;
  skills: string;
  /** Mobile frame trims the last item of this card. */
  skillsMobile?: string;
  tone: "linen" | "forest" | "sand";
  emblem: ImageName;
  art: ImageName;
  artAlt: string;
};

const capabilities: Capability[] = [
  {
    title: "Ecommerce engineering",
    skills: "Shopify themes · Liquid · Custom features · Integrations · Merchandising UI",
    tone: "linen",
    emblem: "emblem-chakra",
    art: "expertise-1",
    artAlt: "Temple gateway framed by floating storefront panels and carved elephants.",
  },
  {
    title: "Frontend craft",
    skills: "JavaScript · HTML · CSS · Responsive UI · Maintainable architecture",
    tone: "forest",
    emblem: "emblem-lotus",
    art: "expertise-2",
    artAlt: "A lotus whose petals are browser windows, set between carved temple pillars.",
  },
  {
    title: "Performance & quality",
    skills: "Core Web Vitals · Technical SEO · QA · Debugging · Documentation",
    tone: "sand",
    emblem: "emblem-conch",
    art: "expertise-3",
    artAlt: "A golden sun-wheel spinning above a river valley.",
  },
  {
    title: "Growth & experience",
    skills:
      "Conversion-minded development · UX implementation · Funnel improvements · Experiment support",
    skillsMobile: "Conversion-minded development · UX implementation · Funnel improvements",
    tone: "linen",
    emblem: "emblem-trishula",
    art: "expertise-4",
    artAlt: "A woman in a sari walking down garden steps towards a winding river and temples.",
  },
];

// 04 — Expertise (Figma desktop 11:125, mobile 120:41).
// Heading first; each card reveals independently with ~90ms stagger and its
// artwork fades in ~100ms after the card content.
export function ExpertiseSection() {
  return (
    <SectionReveal
      id="expertise"
      className={styles.expertise}
      ariaLabelledby="expertise-title"
      distance={12}
      duration={420}
    >
      <div className={styles.inner}>
        <div data-reveal data-reveal-delay="0" className={styles.header}>
          <p className={styles.marker}>
            <span className={styles.number}>03</span>
            Expertise
          </p>
          <h2 id="expertise-title" className={styles.title}>
            <span className={styles.line}>Engineering the details.</span>{" "}
            <span className={`${styles.line} ${styles.subline}`}>Elevating the experience.</span>
          </h2>
        </div>

        <ol className={styles.cards}>
          {capabilities.map((cap, i) => (
            <li
              key={cap.title}
              data-reveal
              data-reveal-delay={String(90 + i * 90)}
              className={styles.card}
              data-tone={cap.tone}
            >
              <div className={styles.text}>
                <Picture
                  name={cap.emblem}
                  alt=""
                  sizes="76px"
                  className={styles.emblem}
                  imgClassName={styles.emblemImg}
                />
                <p className={styles.index}>0{i + 1}</p>
                <h3 className={styles.cardTitle}>{cap.title}</h3>
                <p className={styles.skills}>
                  {cap.skillsMobile ? (
                    <>
                      <span className={styles.desktopOnly}>{cap.skills}</span>
                      <span className={styles.mobileOnly}>{cap.skillsMobile}</span>
                    </>
                  ) : (
                    cap.skills
                  )}
                </p>
              </div>
              <div
                data-reveal="fade"
                data-reveal-delay={String(190 + i * 90)}
                className={styles.artWrap}
              >
                <Picture
                  name={cap.art}
                  alt={cap.artAlt}
                  sizes="(min-width: 1024px) 365px, 100vw"
                  className={styles.art}
                  imgClassName={styles.artImg}
                />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </SectionReveal>
  );
}
