"use client";

/* eslint-disable @next/next/no-img-element -- brand mark and GitHub avatar */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { asset } from "@/lib/base-path";
import { cmsConfig, repoUrl } from "./config";
import { sectionById, sections } from "./schema";
import { useCms } from "./store";
import { Icon, type IconName } from "./ui/Icon";
import { validateSection } from "./validate";
import styles from "./Frame.module.css";

export const editorHref = (id: string) => (id === "site" ? "/admin/settings" : `/admin/sections/${id}`);

/** The admin chrome: top bar (search, account, save bar), sidebar and toasts. */
export function Frame({ children }: { children: ReactNode }) {
  const pathname = usePathname().replace(/\/$/, "");
  // The drawer belongs to the page it was opened on, so navigating closes it.
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const menuOpen = menuFor === pathname;
  const setMenuOpen = (open: boolean) => setMenuFor(open ? pathname : null);
  const { dirtyIds } = useCms();

  const nav = (href: string, label: string, icon: IconName | null, extra?: { sub?: boolean; dot?: boolean }) => (
    <Link
      prefetch={false}
      key={href}
      href={href}
      className={`${styles.navItem} ${extra?.sub ? styles.subItem : ""}`}
      aria-current={pathname === href ? "page" : undefined}
    >
      {icon && (
        <span className={styles.navIcon}>
          <Icon name={icon} />
        </span>
      )}
      <span className={styles.navLabel}>{label}</span>
      {extra?.dot && (
        <span className={styles.navDot} title="Unsaved changes">
          <span className="visually-hidden">(unsaved changes)</span>
        </span>
      )}
    </Link>
  );

  return (
    <div className={styles.frame}>
      <TopBar onMenu={() => setMenuOpen(!menuOpen)} menuOpen={menuOpen} />

      <nav className={styles.sidebar} aria-label="Admin" data-open={menuOpen} id="admin-nav">
        {nav("/admin", "Home", "home")}
        <p className={styles.navHeading}>Homepage sections</p>
        {sections
          .filter((s) => s.group === "sections")
          .map((s) => nav(editorHref(s.id), s.title, s.icon, { dot: dirtyIds.includes(s.id) }))}
        <p className={styles.navHeading}>Content</p>
        {sections
          .filter((s) => s.group === "content")
          .map((s) => nav(editorHref(s.id), s.title, s.icon, { dot: dirtyIds.includes(s.id) }))}
        {nav("/admin/media", "Media", "image")}
        <div className={styles.sidebarFooter}>
          {nav("/admin/settings", "Settings", "settings", { dot: dirtyIds.includes("site") })}
          <a href={cmsConfig.siteUrl} target="_blank" rel="noreferrer" className={styles.navItem}>
            <span className={styles.navIcon}>
              <Icon name="globe" />
            </span>
            <span className={styles.navLabel}>View site</span>
            <span className={styles.navIcon}>
              <Icon name="external" size={16} />
            </span>
            <span className="visually-hidden">(opens in a new tab)</span>
          </a>
        </div>
      </nav>
      {menuOpen && <div className={styles.scrim} onClick={() => setMenuOpen(false)} aria-hidden="true" />}

      <main className={styles.main} id="admin-main">
        {children}
      </main>

      <Toasts />
    </div>
  );
}

function TopBar({ onMenu, menuOpen }: { onMenu: () => void; menuOpen: boolean }) {
  const { dirty, saved } = useCms();
  return (
    <header className={styles.topbar}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
        <button
          type="button"
          className={styles.menuToggle}
          aria-expanded={menuOpen}
          aria-controls="admin-nav"
          onClick={onMenu}
        >
          <Icon name={menuOpen ? "close" : "menu"} />
          <span className="visually-hidden">Menu</span>
        </button>
        <Link prefetch={false} href="/admin" className={styles.brand}>
          <img src={asset("/brand/monogram-primary.svg")} alt="" className={styles.brandMark} />
          <span className={styles.brandName}>{saved?.site.name ?? "Portfolio"} · Admin</span>
        </Link>
      </div>
      {dirty ? (
        <SaveBar />
      ) : (
        <>
          <Search />
          <Account />
        </>
      )}
    </header>
  );
}

function SaveBar() {
  const { draft, dirtyIds, uploads, deletions, saving, save, discard, toast, setShowRequired } = useCms();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  const firstInvalid = dirtyIds.find((id) => {
    const def = sectionById(id);
    return def && draft && Object.keys(validateSection(def, draft[id])).length > 0;
  });

  const summary = [
    dirtyIds.length > 0 && dirtyIds.map((id) => sectionById(id)?.title ?? id).join(", "),
    uploads.length > 0 && `${uploads.length} new file${uploads.length === 1 ? "" : "s"}`,
    deletions.length > 0 && "media removed",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={styles.saveBar} role="region" aria-label="Unsaved changes">
      <p className={styles.saveMessage}>
        <Icon name="alert" />
        <span>
          Unsaved changes<span style={{ fontWeight: 450, color: "#b5b5b5" }}> · {summary}</span>
        </span>
      </p>
      <div className={styles.saveActions}>
        {confirming ? (
          <>
            <button type="button" className={styles.discard} onClick={() => setConfirming(false)}>
              Keep editing
            </button>
            <button
              type="button"
              className={styles.discard}
              style={{ background: "#8e0b21", boxShadow: "none" }}
              onClick={() => {
                discard();
                setConfirming(false);
                toast("Changes discarded");
              }}
            >
              Discard all changes
            </button>
          </>
        ) : (
          <>
            <button type="button" className={styles.discard} onClick={() => setConfirming(true)} disabled={saving}>
              Discard
            </button>
            <button
              type="button"
              className={styles.saveButton}
              disabled={saving}
              onClick={async () => {
                if (firstInvalid) {
                  setShowRequired(true);
                  toast(`Fix the highlighted fields in ${sectionById(firstInvalid)?.title} before saving`, "critical");
                  router.push(editorHref(firstInvalid));
                  return;
                }
                await save();
              }}
            >
              {saving && <Icon name="refresh" size={16} />}
              {saving ? "Saving…" : "Save"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

type Result = { href: string; title: string; meta: string; icon: IconName };

function Search() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const index = useMemo<Result[]>(
    () => [
      { href: "/admin", title: "Home", meta: "Overview and publish status", icon: "home" },
      { href: "/admin/media", title: "Media", meta: "Images and uploads", icon: "image" },
      ...sections.flatMap((s) => [
        { href: editorHref(s.id), title: s.title, meta: s.description, icon: s.icon },
        ...s.cards.flatMap((card) =>
          card.fields.map((f) => ({ href: editorHref(s.id), title: f.label, meta: `${s.title} › ${card.title}`, icon: s.icon })),
        ),
      ]),
    ],
    [],
  );

  const q = query.trim().toLowerCase();
  const results = q
    ? index.filter((r) => `${r.title} ${r.meta}`.toLowerCase().includes(q)).slice(0, 8)
    : [];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (r: Result) => {
    router.push(r.href);
    setQuery("");
    setOpen(false);
    input.current?.blur();
  };

  return (
    <div className={styles.search} role="search">
      <span className={styles.searchIcon}>
        <Icon name="search" />
      </span>
      <input
        ref={input}
        className={styles.searchInput}
        type="search"
        placeholder="Search sections and fields"
        aria-label="Search sections and fields"
        aria-expanded={open && results.length > 0}
        aria-controls="admin-search-results"
        aria-autocomplete="list"
        role="combobox"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, results.length - 1));
          else if (e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0));
          else if (e.key === "Enter" && results[active]) go(results[active]);
          else if (e.key === "Escape") {
            setQuery("");
            input.current?.blur();
          } else return;
          e.preventDefault();
        }}
      />
      {open && results.length > 0 && (
        <div className={styles.results} id="admin-search-results" role="listbox">
          {results.map((r, i) => (
            <Link
      prefetch={false}
              key={`${r.href}-${r.title}-${r.meta}`}
              href={r.href}
              role="option"
              aria-selected={i === active}
              data-active={i === active}
              className={styles.result}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => go(r)}
            >
              <span className={styles.resultIcon}>
                <Icon name={r.icon} />
              </span>
              <span>
                <span style={{ display: "block", fontWeight: 550 }}>{r.title}</span>
                <span className={styles.resultMeta}>{r.meta}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Account() {
  const { user, signOut } = useCms();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  if (!user) return <span />;
  return (
    <div className={styles.account} ref={ref}>
      <button type="button" className={styles.accountButton} aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((v) => !v)}>
        <img src={user.avatar} alt="" className={styles.avatar} />
        <span className={styles.accountName}>{user.name ?? user.login}</span>
      </button>
      {open && (
        <div className={styles.popover} role="menu">
          <div className={styles.popoverHeader}>
            <p style={{ fontWeight: 650 }}>{user.name ?? user.login}</p>
            <p style={{ color: "var(--a-text-secondary)" }}>@{user.login} on GitHub</p>
          </div>
          <a href={repoUrl} target="_blank" rel="noreferrer" className={styles.popoverItem} role="menuitem">
            <Icon name="external" size={16} />
            Open repository
          </a>
          <button type="button" className={styles.popoverItem} role="menuitem" onClick={signOut}>
            <Icon name="logout" size={16} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

function Toasts() {
  const { toasts, dismissToast } = useCms();
  return (
    <div className={styles.toasts} aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={styles.toast} data-tone={t.tone} role={t.tone === "critical" ? "alert" : "status"}>
          {t.message}
          <button type="button" className={styles.toastClose} onClick={() => dismissToast(t.id)} aria-label="Dismiss">
            <Icon name="close" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
