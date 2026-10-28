import { AnimatedSection } from "@/components/AnimatedSection";
import { clientGroups, type Client } from "@/lib/projects";
import styles from "./AllProjectsSection.module.css";

// All projects: a short client list after Featured Work, where
// "View all projects" lands. Reveal in src/animations/allProjects.ts.
export function AllProjectsSection() {
  return (
    <AnimatedSection
      id="projects"
      animation="allProjects"
      className={styles.projects}
      ariaLabelledby="projects-title"
    >
      <div className={styles.inner}>
        <p data-anim="eyebrow" className={styles.eyebrow}>
          All projects
        </p>
        <h2 id="projects-title" data-anim="heading" className={styles.title}>
          Brands I’ve built for
        </h2>

        <div className={styles.groups}>
          {clientGroups.map((group) => (
            <section key={group.region} className={styles.group} aria-labelledby={`region-${slug(group.region)}`}>
              <h3 id={`region-${slug(group.region)}`} data-anim="region" className={styles.region}>
                {group.region}
              </h3>
              <ul className={styles.list}>
                {group.clients.map((client) => (
                  <li key={client.name} data-anim="row" className={styles.row}>
                    <ClientRow client={client} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, "-");

const newTab = <span className="visually-hidden"> (opens in a new tab)</span>;

function ClientRow({ client }: { client: Client }) {
  const [only] = client.sites;

  // One store: the whole row is the link.
  if (client.sites.length === 1) {
    return only.href ? (
      <a href={only.href} target="_blank" rel="noreferrer" className={styles.link}>
        <span className={styles.name}>{client.name}</span>
        <span className={styles.arrow} aria-hidden="true">
          ↗
        </span>
        {newTab}
      </a>
    ) : (
      <span className={styles.link}>
        <span className={styles.name}>{client.name}</span>
      </span>
    );
  }

  // Several regional stores: the name, then a link per region.
  return (
    <span className={styles.link}>
      <span className={styles.name}>{client.name}</span>
      <span className={styles.regions}>
        {client.sites.map((s) =>
          s.href ? (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className={styles.regionLink}>
              {s.label}
              <span className="visually-hidden"> store for {client.name} (opens in a new tab)</span>
            </a>
          ) : null,
        )}
        <span className={styles.arrow} aria-hidden="true">
          ↗
        </span>
      </span>
    </span>
  );
}
