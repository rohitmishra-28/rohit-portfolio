import type { Project } from "@/content/types";
import { Picture } from "./Picture";
import styles from "./ProjectCard.module.css";

type Props = { project: Project; index: number };

/**
 * Featured Work card. Only becomes a link (with the ↗ cue and hover lift)
 * when the project has a live-site URL.
 */
export function ProjectCard({ project, index }: Props) {
  const href = project.href.trim();
  const body = (
    <>
      <p className={styles.name}>{project.name}</p>
      <Picture
        name={project.image}
        alt={project.imageAlt}
        sizes="(min-width: 1024px) 360px, 290px"
        className={styles.media}
        imgClassName={styles.img}
      />
      <div className={styles.footer}>
        <h3 className={styles.title}>{project.title}</h3>
        <p className={styles.stack}>{project.stack}</p>
        <p className={styles.focus}>{project.focus}</p>
        <p className={styles.tags}>{project.tags}</p>
        {href && (
          <span className={styles.arrow} aria-hidden="true">
            ↗
          </span>
        )}
      </div>
    </>
  );

  return (
    <li data-anim="card" className={styles.card} data-tone={index % 2 === 0 ? "dark" : "light"}>
      {href ? (
        <a href={href} className={styles.link} target="_blank" rel="noreferrer">
          {body}
          <span className="visually-hidden"> (opens in a new tab)</span>
        </a>
      ) : (
        <div className={styles.static}>{body}</div>
      )}
    </li>
  );
}
