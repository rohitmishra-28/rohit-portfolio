"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Icon, type IconName } from "./Icon";
import styles from "./ui.module.css";

const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");

/* ---------- Layout ---------- */

export function Page({
  title,
  subtitle,
  backHref,
  badges,
  actions,
  wide,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  backHref?: string;
  badges?: ReactNode;
  actions?: ReactNode;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={cx(styles.page, wide && styles.pageWide)}>
      <header className={styles.pageHeader}>
        <div className={styles.pageTitleRow}>
          {backHref && (
            <ButtonLink href={backHref} variant="plain" icon="back" label="Back" iconOnly />
          )}
          <div style={{ minWidth: 0 }}>
            <div className={styles.pageTitleRow}>
              <h1 className={styles.pageTitle}>{title}</h1>
              {badges}
            </div>
            {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
          </div>
        </div>
        {actions && <div className={styles.pageActions}>{actions}</div>}
      </header>
      {children}
    </div>
  );
}

export function Layout({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  if (!aside) return <div className={styles.stack}>{children}</div>;
  return (
    <div className={styles.layout}>
      <div className={styles.stack}>{children}</div>
      <div className={styles.stack}>{aside}</div>
    </div>
  );
}

export function Stack({ children, tight }: { children: ReactNode; tight?: boolean }) {
  return <div className={tight ? styles.stackTight : styles.stack}>{children}</div>;
}

export function Card({
  title,
  description,
  actions,
  children,
  flush,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  /** Children manage their own padding (lists). */
  flush?: boolean;
}) {
  const header = (title || actions) && (
    <div className={styles.cardHeader}>
      <div>
        {title && <h2 className={styles.cardTitle}>{title}</h2>}
        {description && <p className={styles.cardDescription}>{description}</p>}
      </div>
      {actions}
    </div>
  );
  return (
    <section className={styles.card}>
      {flush ? (
        <>
          {header && <div className={styles.cardSection} style={{ paddingBottom: 4 }}>{header}</div>}
          {children}
        </>
      ) : (
        <div className={styles.cardSection}>
          {header}
          {children}
        </div>
      )}
    </section>
  );
}

export function CardSection({ children }: { children: ReactNode }) {
  return <div className={styles.cardSection}>{children}</div>;
}

/* ---------- Buttons ---------- */

type Variant = "secondary" | "primary" | "plain" | "critical" | "plainCritical";

type ButtonProps = {
  variant?: Variant;
  icon?: IconName;
  iconOnly?: boolean;
  /** Visible text, or the accessible name of an icon-only button. */
  label: string;
  loading?: boolean;
  size?: "medium" | "large";
  fullWidth?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

const buttonClass = (
  variant: Variant,
  iconOnly?: boolean,
  size?: "medium" | "large",
  fullWidth?: boolean,
) =>
  cx(
    styles.button,
    variant === "primary" && styles.primary,
    variant === "critical" && styles.critical,
    (variant === "plain" || variant === "plainCritical") && styles.plain,
    variant === "plainCritical" && styles.plainCritical,
    iconOnly && styles.iconOnly,
    size === "large" && styles.large,
    fullWidth && styles.fullWidth,
  );

export function Button({
  variant = "secondary",
  icon,
  iconOnly,
  label,
  loading,
  size,
  fullWidth,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass(variant, iconOnly, size, fullWidth)}
      disabled={disabled || loading}
      aria-label={iconOnly ? label : undefined}
      title={iconOnly ? label : undefined}
      {...rest}
    >
      {loading ? <Spinner size={16} /> : icon && <Icon name={icon} size={iconOnly ? 20 : 16} />}
      {!iconOnly && label}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "secondary",
  icon,
  iconOnly,
  label,
  external,
}: {
  href: string;
  variant?: Variant;
  icon?: IconName;
  iconOnly?: boolean;
  label: string;
  external?: boolean;
}) {
  const className = buttonClass(variant, iconOnly);
  const content = (
    <>
      {icon && <Icon name={icon} size={iconOnly ? 20 : 16} />}
      {!iconOnly && label}
      {external && <span className="visually-hidden"> (opens in a new tab)</span>}
    </>
  );
  return external ? (
    <a href={href} className={className} target="_blank" rel="noreferrer" aria-label={iconOnly ? label : undefined}>
      {content}
    </a>
  ) : (
    <Link prefetch={false} href={href} className={className} aria-label={iconOnly ? label : undefined} title={iconOnly ? label : undefined}>
      {content}
    </Link>
  );
}

/* ---------- Feedback ---------- */

export type Tone = "default" | "success" | "warning" | "info" | "critical";

export function Badge({ tone = "default", dot, children }: { tone?: Tone; dot?: boolean; children: ReactNode }) {
  return (
    <span className={styles.badge} data-tone={tone}>
      {dot && <span className={styles.badgeDot} aria-hidden="true" />}
      {children}
    </span>
  );
}

export function Banner({
  tone = "info",
  title,
  children,
  actions,
}: {
  tone?: Exclude<Tone, "default">;
  title?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  const icon: IconName = tone === "critical" || tone === "warning" ? "alert" : tone === "success" ? "check" : "info";
  return (
    <div className={styles.banner} data-tone={tone} role={tone === "critical" ? "alert" : "status"}>
      <span className={styles.bannerIcon}>
        <Icon name={icon} />
      </span>
      <div className={styles.bannerBody}>
        {title && <p className={styles.bannerTitle}>{title}</p>}
        {children && <div>{children}</div>}
        {actions && <div className={styles.bannerActions}>{actions}</div>}
      </div>
    </div>
  );
}

export function Spinner({ size = 20, label }: { size?: number; label?: string }) {
  return (
    <svg
      className={styles.spinner}
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
      <path d="M17.5 10A7.5 7.5 0 0 0 10 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>{title}</p>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

/* ---------- Form controls ---------- */

export function FieldShell({
  id,
  label,
  help,
  error,
  optional,
  hideLabel,
  end,
  children,
}: {
  id: string;
  label: string;
  help?: ReactNode;
  error?: string;
  optional?: boolean;
  hideLabel?: boolean;
  /** Right of the label, e.g. a character count. */
  end?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={styles.field}>
      <div className={cx(styles.labelRow, hideLabel && "visually-hidden")}>
        <label htmlFor={id} className={styles.label}>
          {label}
          {optional && <span className={styles.optional}> (optional)</span>}
        </label>
        {end}
      </div>
      {children}
      {error && (
        <p className={styles.error} id={`${id}-error`}>
          <Icon name="alert" size={18} />
          {error}
        </p>
      )}
      {help && !error && (
        <p className={styles.help} id={`${id}-help`}>
          {help}
        </p>
      )}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  help,
  error,
  optional,
  multiline,
  placeholder,
  type = "text",
  hideLabel,
  autoFocus,
  autoComplete,
  monospace,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  help?: ReactNode;
  error?: string;
  optional?: boolean;
  multiline?: boolean;
  placeholder?: string;
  type?: "text" | "password" | "url" | "email" | "search";
  hideLabel?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  monospace?: boolean;
}) {
  const id = useId();
  const describedBy = error ? `${id}-error` : help ? `${id}-help` : undefined;
  const common = {
    id,
    className: styles.input,
    value,
    placeholder,
    autoFocus,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    style: monospace ? { fontFamily: "ui-monospace, monospace" } : undefined,
  };
  return (
    <FieldShell id={id} label={label} help={help} error={error} optional={optional} hideLabel={hideLabel}>
      {multiline ? (
        <AutoGrowTextarea {...common} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input {...common} type={type} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} />
      )}
    </FieldShell>
  );
}

function AutoGrowTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(72, el.scrollHeight + 2)}px`;
  }, [props.value]);
  return <textarea ref={ref} rows={3} {...props} />;
}

export function Select({
  label,
  value,
  onChange,
  options,
  help,
  hideLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  help?: ReactNode;
  hideLabel?: boolean;
}) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} help={help} hideLabel={hideLabel}>
      <select id={id} className={cx(styles.input, styles.select)} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={styles.checkbox}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

/* ---------- Media ---------- */

export function Thumbnail({ src, alt = "", size = 40, icon = "image" }: { src?: string | null; alt?: string; size?: number; icon?: IconName }) {
  return (
    <span className={styles.thumb} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- CMS thumbnails from the repo */}
      {src ? <img src={src} alt={alt} loading="lazy" decoding="async" /> : <Icon name={icon} />}
    </span>
  );
}

/* ---------- Modal ---------- */

export function Modal({
  title,
  open,
  onClose,
  children,
  footer,
  footerStart,
  large,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  footerStart?: ReactNode;
  large?: boolean;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>("[autofocus], input, button:not([data-close])")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && dialog) {
        const focusable = [...dialog.querySelectorAll<HTMLElement>("a[href], button:not(:disabled), input, select, textarea, [tabindex='0']")];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        className={cx(styles.modal, large && styles.modalLarge)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className={styles.modalHeader}>
          <h2 id={titleId} className={styles.modalTitle}>
            {title}
          </h2>
          <Button variant="plain" icon="close" iconOnly label="Close" onClick={onClose} data-close />
        </div>
        <div className={styles.modalBody}>{children}</div>
        {(footer || footerStart) && (
          <div className={styles.modalFooter}>
            {footerStart && <div className={styles.modalFooterStart}>{footerStart}</div>}
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export { cx, styles as uiStyles };
