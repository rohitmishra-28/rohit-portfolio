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

const COLLAPSED_KEY = "cms-sidebar-collapsed";

/**
 * The admin chrome, after the current Shopify admin: a dark full-height
 * sidebar (brand, search, navigation, account) beside the page, which sits in
 * a rounded panel. The save bar appears at the top of that panel.
 */
export function Frame({ children }: { children: ReactNode }) {
  const pathname = usePathname().replace(/\/$/, "");
  // The drawer belongs to the page it was opened on, so navigating closes it.
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const menuOpen = menuFor === pathname;
  const setMenuOpen = (open: boolean) => setMenuFor(open ? pathname : null);
  // The Frame only renders after sign-in on the client, so storage is readable here.
  const [collapsed, setCollapsedState] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === "1";
    } catch {
      return false;
    }
  });
  const setCollapsed = (value: boolean) => {
    setCollapsedState(value);
    try {
      localStorage.setItem(COLLAPSED_KEY, value ? "1" : "0");
    } catch {}
  };
  const { dirty, dirtyIds, saved } = useCms();

  const nav = (href: string, label: string, icon: IconName, dot?: boolean) => (
    <Link
      prefetch={false}
      key={href}
      href={href}
      className={styles.navItem}
      aria-current={pathname === href ? "page" : undefined}
      title={collapsed ? label : undefined}
    >
      <span className={styles.navIcon}>
        <Icon name={icon} />
      </span>
      <span className={styles.navLabel}>{label}</span>
      {dot && (
        <span className={styles.navDot} title="Unsaved changes">
          <span className="visually-hidden">(unsaved changes)</span>
        </span>
      )}
    </Link>
  );

  return (
    <div className={styles.frame} data-collapsed={collapsed}>
      <header className={styles.mobileBar}>
        <button
          type="button"
          className={styles.iconButton}
          aria-expanded={menuOpen}
          aria-controls="admin-nav"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Icon name={menuOpen ? "close" : "menu"} />
          <span className="visually-hidden">Menu</span>
        </button>
        <Link prefetch={false} href="/admin" className={styles.mobileBrand}>
          <img src={asset("/brand/monogram-primary.svg")} alt="" className={styles.brandMark} />
          <span>{saved?.site.name ?? "Portfolio"}</span>
        </Link>
      </header>

      <nav className={styles.sidebar} aria-label="Admin" data-open={menuOpen} id="admin-nav">
        <div className={styles.sidebarTop}>
          <div className={styles.brandRow}>
            <Link prefetch={false} href="/admin" className={styles.brand} title="Home">
              <img src={asset("/brand/monogram-primary.svg")} alt="" className={styles.brandMark} />
              <span className="visually-hidden">{saved?.site.name ?? "Portfolio"} admin home</span>
            </Link>
            <button
              type="button"
              className={`${styles.iconButton} ${styles.collapseToggle}`}
              aria-pressed={collapsed}
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Icon name="sidebar" />
              <span className="visually-hidden">{collapsed ? "Expand sidebar" : "Collapse sidebar"}</span>
            </button>
          </div>
          <Search variant="sidebar" onExpand={() => setCollapsed(false)} />
        </div>

        <div className={styles.navScroll}>
          {nav("/admin", "Home", "home")}
          <p className={styles.navHeading}>
            Homepage sections <Icon name="chevronRight" size={12} />
          </p>
          {sections.filter((s) => s.group === "sections").map((s) => nav(editorHref(s.id), s.title, s.icon, dirtyIds.includes(s.id)))}
          <p className={styles.navHeading}>
            Content <Icon name="chevronRight" size={12} />
          </p>
          {sections.filter((s) => s.group === "content").map((s) => nav(editorHref(s.id), s.title, s.icon, dirtyIds.includes(s.id)))}
          {nav("/admin/media", "Media", "image")}
        </div>

        <div className={styles.sidebarFooter}>
          {nav("/admin/settings", "Settings", "settings", dirtyIds.includes("site"))}
          <a href={cmsConfig.siteUrl} target="_blank" rel="noreferrer" className={styles.navItem} title={collapsed ? "View site" : undefined}>
            <span className={styles.navIcon}>
              <Icon name="globe" />
            </span>
            <span className={styles.navLabel}>View site</span>
            <span className={`${styles.navIcon} ${styles.navTrailing}`}>
              <Icon name="external" size={16} />
            </span>
            <span className="visually-hidden">(opens in a new tab)</span>
          </a>
          <Account />
        </div>
      </nav>
      {menuOpen && <div className={styles.scrim} onClick={() => setMenuOpen(false)} aria-hidden="true" />}

      <div className={styles.panel}>
        {dirty && <SaveBar />}
        <main className={styles.main} id="admin-main">
          {children}
        </main>
      </div>

      <Toasts />
    </div>
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
          Unsaved changes<span className={styles.saveSummary}> · {summary}</span>
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

/**
 * Jump to any section or field. The sidebar copy answers Ctrl/⌘ K; the Home
 * copy is the big search box under the greeting.
 */
export function Search({ variant, onExpand }: { variant: "sidebar" | "hero"; onExpand?: () => void }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const sidebar = variant === "sidebar";
  const label = sidebar ? "Search sections and fields" : "What do you want to edit?";
  const listId = `admin-search-results-${variant}`;

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
    if (!sidebar) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onExpand?.();
        requestAnimationFrame(() => input.current?.focus());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebar, onExpand]);

  const go = (r: Result) => {
    router.push(r.href);
    setQuery("");
    setOpen(false);
    input.current?.blur();
  };

  const field = (
    <input
      ref={input}
      className={styles.searchInput}
      type="search"
      placeholder={sidebar ? "Search" : "What do you want to edit? Try “headline”, “résumé” or “email”"}
      aria-label={label}
      aria-expanded={open && results.length > 0}
      aria-controls={listId}
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
  );

  return (
    <div className={styles.search} data-variant={variant} role="search">
      {sidebar && (
        <button
          type="button"
          className={styles.searchCollapsed}
          onClick={() => {
            onExpand?.();
            requestAnimationFrame(() => input.current?.focus());
          }}
          title="Search"
        >
          <Icon name="search" />
          <span className="visually-hidden">Search</span>
        </button>
      )}
      <label className={styles.searchField}>
        {sidebar && (
          <span className={styles.searchIcon}>
            <Icon name="search" size={16} />
          </span>
        )}
        {field}
        {sidebar && <kbd className={styles.kbd}>Ctrl K</kbd>}
      </label>
      {open && results.length > 0 && (
        <div className={styles.results} id={listId} role="listbox">
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

  if (!user) return null;
  return (
    <div className={styles.account} ref={ref}>
      <button
        type="button"
        className={styles.accountButton}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        title={user.name ?? user.login}
      >
        <img src={user.avatar} alt="" className={styles.avatar} />
        <span className={styles.navLabel}>{user.name ?? user.login}</span>
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
