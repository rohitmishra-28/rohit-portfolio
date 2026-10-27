import { Picture } from "@/components/Picture";
import { ProjectCard } from "@/components/ProjectCard";
import { SectionReveal } from "@/components/SectionReveal";
import { projects } from "@/lib/projects";
import { ctaLinks } from "@/lib/site-config";
import styles from "./FeaturedWorkSection.module.css";

// 03 — Featured Work (Figma desktop 11:85, mobile 120:23).
// Heading and intro reveal as a group; cards rise 18px with ~90ms stagger.
export function FeaturedWorkSection() {
  return (
    <SectionReveal
      id="work"
      className={styles.work}
      ariaLabelledby="work-title"
      distance={18}
      duration={420}
      stagger={90}
      // Any sliver of a card peeking into the mobile scroller reveals it.
      threshold={0}
    >
      <Picture
        name="work-bg"
        alt=""
        sizes="100vw"
        className={styles.art}
        imgClassName={styles.artImg}
      />

      <div className={styles.inner}>
        <div data-reveal className={styles.header}>
          <div>
            <p className={styles.marker}>
              <span className={styles.number}>02</span>
              Featured work
            </p>
            <h2 id="work-title" className={styles.title}>
              <span className={styles.line}>Digital products</span>{" "}
              <span className={`${styles.line} ${styles.accent}`}>that create impact.</span>
            </h2>
            <p className={`${styles.intro} ${styles.introDesktop}`}>
              A selection of projects where I’ve helped brands solve real problems, improve user
              experience and build better ecommerce journeys.
            </p>
            <p className={`${styles.intro} ${styles.introMobile}`}>
              Selected projects where engineering, brand craft and customer experience meet.
            </p>
          </div>
          <a href={ctaLinks.viewAllProjects} className={styles.cta}>
            <span className={styles.circle} aria-hidden="true">
              →
            </span>
            View all projects
          </a>
        </div>

        {/* Focusable so keyboard users can scroll the mobile card row. */}
        <ul className={styles.cards} aria-label="Featured projects" tabIndex={0}>
          {projects.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </ul>

        <p data-reveal className={styles.note}>
          Selected work shaped by each brand’s craft, story, and customer journey.
        </p>
      </div>
    </SectionReveal>
  );
}
