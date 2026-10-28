"use client";

/* eslint-disable @next/next/no-img-element -- GitHub avatars */
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { cmsConfig, repoUrl } from "../config";
import { editorHref, Search } from "../Frame";
import type { CommitSummary } from "../github";
import { sectionById, sections } from "../schema";
import { useDraft, type Deploy } from "../store";
import { Icon, type IconName } from "../ui/Icon";
import { Badge, Spinner, type Tone } from "../ui/primitives";
import styles from "./Home.module.css";
import screens from "./screens.module.css";

export const timeAgo = (iso: string) => {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

export function deployInfo(deploy: Deploy | null): { title: string; detail: string; tone: Tone; icon: IconName; busy?: boolean } {
  switch (deploy?.status) {
    case "live":
      return { title: "Your site is live", detail: deploy.at ? `Last published ${timeAgo(deploy.at)}` : "Published", tone: "success", icon: "check" };
    case "queued":
      return { title: "Publishing soon", detail: "Waiting for GitHub to start the build…", tone: "info", icon: "clock", busy: true };
    case "building":
      return { title: "Publishing your changes", detail: "Building the site. This usually takes 2–3 minutes.", tone: "info", icon: "refresh", busy: true };
    case "failed":
      return { title: "Publishing failed", detail: "The site still shows the previous version. Open the build log to see why.", tone: "critical", icon: "alert" };
    case "cancelled":
      return { title: "Publish replaced", detail: "A newer save took over this build.", tone: "default", icon: "refresh" };
    default:
      return { title: "Publish status unavailable", detail: "Give the token Actions: Read-only access to see build progress.", tone: "default", icon: "info" };
  }
}

export function PublishStatus({ compact }: { compact?: boolean }) {
  const { deploy } = useDraft();
  const info = deployInfo(deploy);
  return (
    <div className={screens.status}>
      <span className={screens.statusIcon} data-tone={info.tone}>
        {info.busy ? <Spinner size={20} /> : <Icon name={info.icon} />}
      </span>
      <div style={{ minWidth: 0 }}>
        <p className={screens.statusTitle}>{info.title}</p>
        <p style={{ color: "var(--a-text-secondary)" }}>
          {info.detail}
          {!compact && deploy?.url && (
            <>
              {" "}
              <a href={deploy.url} target="_blank" rel="noreferrer">
                View build<span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

const statusLabel: Record<string, string> = {
  live: "Live",
  queued: "Queued",
  building: "Publishing",
  failed: "Failed",
  cancelled: "Replaced",
};

/** A pill under the search box, like Shopify's "Fulfil orders 50+". */
function Chip({ href, external, label, count, tone }: { href: string; external?: boolean; label: string; count?: ReactNode; tone?: string }) {
  const body = (
    <>
      {label}
      {count != null && (
        <span className={styles.chipCount} data-tone={tone}>
          {count}
        </span>
      )}
    </>
  );
  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={styles.chip}>
      {body}
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  ) : (
    <Link prefetch={false} href={href} className={styles.chip}>
      {body}
    </Link>
  );
}

function Tile({ title, children, action }: { title: string; children: ReactNode; action: ReactNode }) {
  return (
    <section className={styles.tile}>
      <h2 className={styles.tileTitle}>{title}</h2>
      <div className={styles.tileBody}>{children}</div>
      <div className={styles.tileAction}>{action}</div>
    </section>
  );
}

export function Home() {
  const { user, dirtyIds, github, deploy } = useDraft();
  const [activity, setActivity] = useState<CommitSummary[] | null>(null);
  const info = deployInfo(deploy);
  const firstName = user?.name?.split(" ")[0] ?? user?.login;

  useEffect(() => {
    github
      ?.recentCommits(cmsConfig.contentDir)
      .then(setActivity)
      .catch(() => setActivity([]));
  }, [github, deploy?.sha]);

  const grid = (ids: { href: string; title: string; description: string; icon: IconName; dirty?: boolean }[]) => (
    <ul className={styles.sectionGrid}>
      {ids.map((s) => (
        <li key={s.href}>
          <Link prefetch={false} href={s.href} className={styles.sectionCard}>
            <span className={screens.resourceIcon}>
              <Icon name={s.icon} />
            </span>
            <span className={styles.sectionText}>
              <span className={styles.sectionTitle}>
                {s.title}
                {s.dirty && <Badge tone="warning" dot>Unsaved</Badge>}
              </span>
              <span className={styles.sectionMeta}>{s.description}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );

  const fromSchema = (group: "sections" | "content") =>
    sections
      .filter((s) => s.group === group)
      .map((s) => ({ href: editorHref(s.id), title: s.title, description: s.description, icon: s.icon, dirty: dirtyIds.includes(s.id) }));

  return (
    <div className={styles.home}>
      <header className={styles.hero}>
        <p className={styles.hello}>Hey {firstName ?? "there"}!</p>
        <h1 className={styles.headline}>Let’s keep your portfolio fresh.</h1>

        <div className={styles.searchBox}>
          <Search variant="hero" />
          <div className={styles.searchFooter}>
            <span className={styles.searchGlyph}>
              <Icon name="search" />
            </span>
            <div className={styles.searchLinks}>
              <a href="#recent-changes" className={styles.searchLink}>
                <Icon name="history" size={16} />
                Recents
              </a>
              <span className={styles.divider} aria-hidden="true" />
              <Link prefetch={false} href="/admin/media" className={styles.searchLink} title="Add images and files">
                <Icon name="plus" size={16} />
                <span className="visually-hidden">Add images and files</span>
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.chips}>
          {dirtyIds.length > 0 && (
            <Chip href={editorHref(dirtyIds[0])} label="Unsaved changes" count={dirtyIds.length} tone="warning" />
          )}
          <Chip
            href={deploy?.url ?? cmsConfig.siteUrl}
            external
            label="Publish status"
            count={statusLabel[deploy?.status ?? ""] ?? "Unknown"}
            tone={info.tone}
          />
          <Chip href={cmsConfig.siteUrl} external label="View site" />
        </div>
      </header>

      <div className={styles.tiles}>
        <Tile
          title="Publish status"
          action={
            deploy?.url ? (
              <a href={deploy.url} target="_blank" rel="noreferrer" className={styles.pill}>
                View build<span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            ) : (
              <a href={cmsConfig.siteUrl} target="_blank" rel="noreferrer" className={styles.pill}>
                View site<span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            )
          }
        >
          <PublishStatus compact />
        </Tile>

        <Tile
          title="Recent changes"
          action={
            <a href={`${repoUrl}/commits/${cmsConfig.branch}`} target="_blank" rel="noreferrer" className={styles.pill}>
              View history<span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          }
        >
          <div id="recent-changes">
            {activity === null ? (
              <Spinner label="Loading recent changes" />
            ) : activity.length === 0 ? (
              <p className={styles.muted}>No content changes yet.</p>
            ) : (
              <ul className={screens.activity}>
                {activity.slice(0, 3).map((c) => (
                  <li key={c.sha} className={screens.activityItem}>
                    {c.author ? <img src={c.author.avatar_url} alt="" className={screens.activityAvatar} /> : <span className={screens.activityAvatar} />}
                    <div className={screens.activityText}>
                      <a href={c.html_url} target="_blank" rel="noreferrer">
                        {c.commit.message.split("\n")[0]}
                        <span className="visually-hidden"> (opens in a new tab)</span>
                      </a>
                      <p className={styles.muted}>
                        {c.author?.login ?? c.commit.author.name} · {timeAgo(c.commit.author.date)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Tile>

        <Tile
          title="How publishing works"
          action={
            <Link prefetch={false} href={editorHref("hero")} className={styles.pill}>
              Start with the hero
            </Link>
          }
        >
          <p className={styles.muted}>
            Edit any section and use the preview to check it. Changes stay private until you save. Saving commits to GitHub and
            the site is live in about 2–3 minutes. Every save is kept in the history.
          </p>
        </Tile>
      </div>

      <section className={styles.group} aria-labelledby="home-sections">
        <h2 id="home-sections" className={styles.groupTitle}>
          Homepage sections
          <span className={styles.groupMeta}>In the order they appear on the page</span>
        </h2>
        {grid(fromSchema("sections"))}
      </section>

      <section className={styles.group} aria-labelledby="home-content">
        <h2 id="home-content" className={styles.groupTitle}>
          More content
        </h2>
        {grid([
          ...fromSchema("content"),
          { href: "/admin/media", title: "Media", description: "Every image and file on the site.", icon: "image" },
          {
            href: "/admin/settings",
            title: sectionById("site")?.title ?? "Settings",
            description: "Name, contact details, résumé, menu and search listing.",
            icon: "settings",
            dirty: dirtyIds.includes("site"),
          },
        ])}
      </section>
    </div>
  );
}
