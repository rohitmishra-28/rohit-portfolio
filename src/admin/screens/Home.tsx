"use client";

/* eslint-disable @next/next/no-img-element -- GitHub avatars */
import Link from "next/link";
import { useEffect, useState } from "react";
import { cmsConfig, repoUrl } from "../config";
import { editorHref } from "../Frame";
import type { CommitSummary } from "../github";
import { sections } from "../schema";
import { useDraft, type Deploy } from "../store";
import { Icon, type IconName } from "../ui/Icon";
import { Badge, ButtonLink, Card, Layout, Page, Spinner, type Tone } from "../ui/primitives";
import styles from "./screens.module.css";

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
    <div className={styles.status}>
      <span className={styles.statusIcon} data-tone={info.tone}>
        {info.busy ? <Spinner size={20} /> : <Icon name={info.icon} />}
      </span>
      <div style={{ minWidth: 0 }}>
        <p className={styles.statusTitle}>{info.title}</p>
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

export function Home() {
  const { user, dirtyIds, github, deploy } = useDraft();
  const [activity, setActivity] = useState<CommitSummary[] | null>(null);

  useEffect(() => {
    github
      ?.recentCommits(cmsConfig.contentDir)
      .then(setActivity)
      .catch(() => setActivity([]));
  }, [github, deploy?.sha]);

  const list = (group: "sections" | "content") => (
    <ul className={styles.resourceList}>
      {sections
        .filter((s) => s.group === group)
        .map((s) => (
          <li key={s.id}>
            <Link prefetch={false} href={editorHref(s.id)} className={styles.resource}>
              <span className={styles.resourceIcon}>
                <Icon name={s.icon} />
              </span>
              <span className={styles.resourceText}>
                <span className={styles.resourceTitle}>{s.title}</span>
                <span className={styles.resourceMeta} style={{ display: "block" }}>
                  {s.description}
                </span>
              </span>
              {dirtyIds.includes(s.id) && <Badge tone="warning" dot>Unsaved</Badge>}
              <span className={styles.chevron}>
                <Icon name="chevronRight" />
              </span>
            </Link>
          </li>
        ))}
    </ul>
  );

  return (
    <Page
      title="Home"
      actions={<ButtonLink href={cmsConfig.siteUrl} external icon="globe" label="View site" />}
    >
      <Layout
        aside={
          <>
            <Card title="Recent changes">
              {activity === null ? (
                <Spinner label="Loading recent changes" />
              ) : activity.length === 0 ? (
                <p style={{ color: "var(--a-text-secondary)" }}>No content changes yet.</p>
              ) : (
                <ul className={styles.activity}>
                  {activity.map((c) => (
                    <li key={c.sha} className={styles.activityItem}>
                      {c.author ? <img src={c.author.avatar_url} alt="" className={styles.activityAvatar} /> : <span className={styles.activityAvatar} />}
                      <div className={styles.activityText}>
                        <a href={c.html_url} target="_blank" rel="noreferrer">
                          {c.commit.message.split("\n")[0]}
                          <span className="visually-hidden"> (opens in a new tab)</span>
                        </a>
                        <p style={{ color: "var(--a-text-secondary)" }}>
                          {c.author?.login ?? c.commit.author.name} · {timeAgo(c.commit.author.date)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card title="How publishing works">
              <p style={{ color: "var(--a-text-secondary)" }}>
                Saving commits your changes to GitHub. The site rebuilds automatically and is live in about 2–3 minutes.
                Every save is kept in the{" "}
                <a href={`${repoUrl}/commits/${cmsConfig.branch}`} target="_blank" rel="noreferrer">
                  history<span className="visually-hidden"> (opens in a new tab)</span>
                </a>
                , so nothing is ever lost.
              </p>
            </Card>
          </>
        }
      >
        <div className={styles.welcome}>
          <p className={styles.welcomeTitle}>Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}</p>
          <p style={{ color: "var(--a-text-secondary)" }}>
            Pick a section to edit its text, images and links. Changes stay private until you save.
          </p>
        </div>
        <Card>
          <PublishStatus />
        </Card>
        <Card title="Homepage sections" description="In the order they appear on the page." flush>
          {list("sections")}
        </Card>
        <Card title="More content" flush>
          {list("content")}
          <ul className={styles.resourceList}>
            <li>
              <Link prefetch={false} href="/admin/media" className={styles.resource} style={{ borderTop: "1px solid var(--a-border-subdued)" }}>
                <span className={styles.resourceIcon}>
                  <Icon name="image" />
                </span>
                <span className={styles.resourceText}>
                  <span className={styles.resourceTitle}>Media</span>
                  <span className={styles.resourceMeta} style={{ display: "block" }}>
                    Every image and file on the site.
                  </span>
                </span>
                <span className={styles.chevron}>
                  <Icon name="chevronRight" />
                </span>
              </Link>
            </li>
            <li>
              <Link prefetch={false} href="/admin/settings" className={styles.resource}>
                <span className={styles.resourceIcon}>
                  <Icon name="settings" />
                </span>
                <span className={styles.resourceText}>
                  <span className={styles.resourceTitle}>Settings</span>
                  <span className={styles.resourceMeta} style={{ display: "block" }}>
                    Name, contact details, résumé, menu and search listing.
                  </span>
                </span>
                {dirtyIds.includes("site") && <Badge tone="warning" dot>Unsaved</Badge>}
                <span className={styles.chevron}>
                  <Icon name="chevronRight" />
                </span>
              </Link>
            </li>
          </ul>
        </Card>
      </Layout>
    </Page>
  );
}
