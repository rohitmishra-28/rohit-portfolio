import { AnimatedSection } from "@/components/AnimatedSection";
import { Picture } from "@/components/Picture";
import { ProjectCard } from "@/components/ProjectCard";
import { projects } from "@/lib/projects";
import { ctaLinks } from "@/lib/site-config";
import styles from "./FeaturedWorkSection.module.css";

// 03 — Featured Work (Figma desktop 11:85, mobile 120:23).
// Timeline in src/animations/work.ts.
export function FeaturedWorkSection() {
  return (
    <AnimatedSection id="work" animation="work" className={styles.work} ariaLabelledby="work-title">
      <Picture
        name="work-bg"
        alt=""
        sizes="100vw"
        className={styles.art}
        imgClassName={styles.artImg}
      />

      <div className={styles.inner}>
        <div className={styles.header}>
          <div>
            <p data-anim="marker" className={styles.marker}>
              <span className={styles.number}>02</span>
              Featured work
            </p>
            <h2 id="work-title" className={styles.title}>
              <span data-anim="mask" className={styles.line}>
                <span>Digital products</span>
              </span>{" "}
              <span data-anim="mask" className={styles.line}>
                <span className={styles.accent}>that create impact.</span>
              </span>
            </h2>
            <p data-anim="intro" className={`${styles.intro} ${styles.introDesktop}`}>
              A selection of projects where I’ve helped brands solve real problems, improve user
              experience and build better ecommerce journeys.
            </p>
            <p data-anim="intro" className={`${styles.intro} ${styles.introMobile}`}>
              Selected projects where engineering, brand craft and customer experience meet.
            </p>
          </div>
          <a data-anim="cta" href={ctaLinks.viewAllProjects} className={styles.cta}>
            <span className={styles.circle} aria-hidden="true">
              →
            </span>
            View all projects
          </a>
        </div>

        {/* Focusable so keyboard users can scroll the mobile card row. */}
        <ul
          className={styles.cards}
          aria-label="Featured projects"
          tabIndex={0}
          data-anim="cards"
        >
          {projects.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </ul>

        <p data-anim="note" className={styles.note}>
          Selected work shaped by each brand’s craft, story, and customer journey.
        </p>
      </div>
    </AnimatedSection>
  );
}
