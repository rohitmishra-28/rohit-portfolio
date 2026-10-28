"use client";

import { Fragment, useId, useState, type ReactNode } from "react";
import { images as builtImages } from "@/lib/images.generated";
import type { Field } from "../schema";
import { pageAnchors } from "../schema";
import { formatBytes, useCms, useImageUrl } from "../store";
import { errorsUnder, type Errors } from "../validate";
import { Icon } from "./Icon";
import { FilePicker, ImagePicker } from "./library";
import { Badge, Button, FieldShell, Select, TextField, Thumbnail, uiStyles } from "./primitives";
import styles from "./fields.module.css";

// Editors for each schema field type. Values are edited immutably: every
// editor reports a whole new value for its key up to the section.

type Props = {
  field: Field;
  value: unknown;
  onChange: (value: unknown) => void;
  path: string;
  errors: Errors;
};

export function FieldList({
  fields,
  value,
  onChange,
  path,
  errors,
}: {
  fields: Field[];
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  path?: string;
  errors: Errors;
}) {
  return (
    <div className={styles.fields}>
      {fields.map((field) => (
        <FieldEditor
          key={field.key}
          field={field}
          value={value?.[field.key]}
          onChange={(v) => onChange({ ...value, [field.key]: v })}
          path={path ? `${path}.${field.key}` : field.key}
          errors={errors}
        />
      ))}
    </div>
  );
}

export function FieldEditor({ field, value, onChange, path, errors }: Props) {
  const error = errors[path];
  switch (field.type) {
    case "text":
      return (
        <TextField
          label={field.label}
          value={String(value ?? "")}
          onChange={onChange}
          help={field.help}
          error={error}
          optional={field.optional}
          multiline={field.multiline}
          placeholder={field.placeholder}
          type={field.key === "email" ? "email" : "text"}
        />
      );
    case "select":
      return (
        <Select label={field.label} value={String(value ?? "")} onChange={onChange} options={field.options} help={field.help} />
      );
    case "lines":
      return <LinesField field={field} value={value as string[]} onChange={onChange} path={path} errors={errors} />;
    case "link":
      return <LinkField label={field.label} help={field.help} optional={field.optional} value={String(value ?? "")} onChange={onChange} error={error} />;
    case "image":
      return <ImageField label={field.label} help={field.help} value={String(value ?? "")} onChange={onChange} error={error} />;
    case "file":
      return (
        <FileField
          label={field.label}
          help={field.help}
          accept={field.accept}
          kind={field.kind}
          value={String(value ?? "")}
          onChange={onChange}
          error={error}
        />
      );
    case "group":
      return (
        <div>
          <p className={styles.groupLabel}>{field.label}</p>
          <div className={styles.row}>
            {field.fields.map((f) => (
              <FieldEditor
                key={f.key}
                field={f}
                value={(value as Record<string, unknown>)?.[f.key]}
                onChange={(v) => onChange({ ...(value as Record<string, unknown>), [f.key]: v })}
                path={`${path}.${f.key}`}
                errors={errors}
              />
            ))}
          </div>
        </div>
      );
    case "list":
      return (
        <ListField
          field={field}
          value={(value as Record<string, unknown>[]) ?? []}
          onChange={onChange}
          path={path}
          errors={errors}
        />
      );
  }
}

/* ---------- Title lines ---------- */

function LinesField({
  field,
  value,
  onChange,
  path,
  errors,
}: {
  field: Extract<Field, { type: "lines" }>;
  value: string[];
  onChange: (value: string[]) => void;
  path: string;
  errors: Errors;
}) {
  const id = useId();
  const lines = value?.length ? value : [""];
  const max = field.max ?? 6;
  const set = (i: number, text: string) => onChange(lines.map((l, j) => (j === i ? text : l)));
  const lineError = lines.map((_, i) => errors[`${path}.${i}`]).find(Boolean);

  return (
    <FieldShell id={`${id}-0`} label={field.label} help={field.help} error={errors[path] ?? lineError}>
      <div className={styles.lines}>
        {lines.map((line, i) => (
          <div key={i} className={styles.lineRow}>
            <span className={styles.lineIndex} aria-hidden="true">
              {i + 1}
            </span>
            <input
              id={`${id}-${i}`}
              className={uiStyles.input}
              value={line}
              aria-label={`${field.label}, line ${i + 1}`}
              aria-invalid={errors[`${path}.${i}`] ? true : undefined}
              onChange={(e) => set(i, e.target.value)}
            />
            {lines.length > (field.min ?? 1) && (
              <Button
                variant="plain"
                icon="trash"
                iconOnly
                label={`Remove line ${i + 1}`}
                onClick={() => onChange(lines.filter((_, j) => j !== i))}
              />
            )}
          </div>
        ))}
        <div className={styles.listFooter}>
          {lines.length < max ? (
            <Button variant="plain" icon="plus" label="Add line" onClick={() => onChange([...lines, ""])} />
          ) : (
            <span />
          )}
        </div>
        <p className={styles.linePreview} aria-label="Preview">
          {lines.map((line, i) => (
            <Fragment key={i}>
              {line.split(/\*([^*]+)\*/).map((part, j) => (j % 2 ? <mark key={j}>{part}</mark> : part))}
              {i < lines.length - 1 && " "}
            </Fragment>
          ))}
        </p>
      </div>
    </FieldShell>
  );
}

/* ---------- Links ---------- */

const shortcuts = [
  { label: "Résumé (PDF)", value: "site:resume" },
  { label: "Email", value: "site:email" },
  { label: "LinkedIn", value: "site:linkedin" },
  { label: "GitHub", value: "site:github" },
];

function describeLink(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  const shortcut = shortcuts.find((s) => s.value === v);
  if (shortcut) return `${shortcut.label}, from Settings`;
  const anchor = pageAnchors.find((a) => a.value === v);
  if (anchor) return `Scrolls to ${anchor.label}`;
  if (/^https?:\/\//.test(v)) return "Opens in a new tab";
  if (v.startsWith("mailto:")) return "Opens an email";
  if (v.startsWith("/")) return "A file on your site";
  return null;
}

export function LinkField({
  label,
  help,
  optional,
  value,
  onChange,
  error,
}: {
  label: string;
  help?: ReactNode;
  optional?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const id = useId();
  const meaning = describeLink(value);
  return (
    <FieldShell id={id} label={label} help={help ?? meaning} error={error} optional={optional}>
      <div className={styles.linkRow}>
        <input
          id={id}
          className={uiStyles.input}
          value={value}
          placeholder="https://… or #section"
          aria-invalid={error ? true : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
        <select
          className={`${uiStyles.input} ${uiStyles.select} ${styles.linkSelect}`}
          aria-label={`Choose a destination for ${label}`}
          value=""
          onChange={(e) => e.target.value && onChange(e.target.value)}
        >
          <option value="">Link to…</option>
          <optgroup label="On this page">
            {pageAnchors.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="From Settings">
            {shortcuts.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </optgroup>
        </select>
      </div>
      {help && meaning && !error && (
        <p className={styles.linkMeaning}>
          <Icon name="link" size={16} />
          {meaning}
        </p>
      )}
    </FieldShell>
  );
}

/* ---------- Images ---------- */

function ImageField({
  label,
  help,
  value,
  onChange,
  error,
}: {
  label: string;
  help?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const { images } = useCms();
  const url = useImageUrl(value || null);
  const image = images.find((i) => i.name === value);
  const built = value && value in builtImages ? builtImages[value as keyof typeof builtImages] : null;

  return (
    <FieldShell id={id} label={label} help={help} error={error}>
      <div className={styles.media}>
        <Thumbnail src={url} size={64} />
        <div className={styles.mediaInfo}>
          <span className={styles.mediaName}>{value || "No image selected"}</span>
          <span className={styles.mediaMeta}>
            {built
              ? `${built.width} × ${built.height}`
              : image?.pending
                ? "New, uploads when you save"
                : image
                  ? "Published after the next deploy"
                  : value
                    ? "Missing from the media library"
                    : "Choose or upload an image"}
          </span>
        </div>
        <div className={styles.mediaActions}>
          <Button id={id} label={value ? "Change" : "Select"} onClick={() => setOpen(true)} />
        </div>
      </div>
      <ImagePicker
        open={open}
        title={`Select ${label.toLowerCase()}`}
        selected={value}
        onClose={() => setOpen(false)}
        onSelect={(name) => {
          onChange(name);
          setOpen(false);
        }}
      />
    </FieldShell>
  );
}

/* ---------- Files ---------- */

function FileField({
  label,
  help,
  accept,
  kind,
  value,
  onChange,
  error,
}: {
  label: string;
  help?: ReactNode;
  accept: string;
  kind: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const { publicFiles, fileUrl } = useCms();
  const file = publicFiles.find((f) => f.url === value);
  const isImage = /\.(png|jpe?g|webp|svg|gif)$/i.test(value);

  return (
    <FieldShell id={id} label={label} help={help} error={error}>
      <div className={styles.media}>
        <Thumbnail src={isImage && value ? fileUrl(value) : null} size={48} icon={/\.(webm|mp4)$/i.test(value) ? "eye" : "file"} />
        <div className={styles.mediaInfo}>
          <span className={styles.mediaName}>{value ? value.slice(value.lastIndexOf("/") + 1) : `No ${kind} selected`}</span>
          <span className={styles.mediaMeta}>
            {file ? `${file.pending ? "New · " : ""}${formatBytes(file.size)} · ${value}` : value ? `${value} · not found in the repository` : ""}
          </span>
        </div>
        <div className={styles.mediaActions}>
          {value && !file?.pending && (
            <Button variant="plain" icon="external" iconOnly label={`Open ${label.toLowerCase()}`} onClick={() => window.open(fileUrl(value), "_blank", "noopener")} />
          )}
          <Button id={id} label={value ? "Replace" : "Select"} onClick={() => setOpen(true)} />
        </div>
      </div>
      <FilePicker
        open={open}
        title={`Select ${label.toLowerCase()}`}
        accept={accept}
        kind={kind}
        selected={value}
        onClose={() => setOpen(false)}
        onSelect={(path) => {
          onChange(path);
          setOpen(false);
        }}
      />
    </FieldShell>
  );
}

/* ---------- Lists ---------- */

function ListField({
  field,
  value,
  onChange,
  path,
  errors,
}: {
  field: Extract<Field, { type: "list" }>;
  value: Record<string, unknown>[];
  onChange: (value: Record<string, unknown>[]) => void;
  path: string;
  errors: Errors;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const imageField = field.fields.find((f) => f.type === "image");
  const max = field.max ?? 50;
  const min = field.min ?? 0;

  const move = (from: number, to: number) => {
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
    setOpen(to);
  };

  return (
    <div>
      {value.length > 0 && (
        <div className={styles.list}>
          {value.map((item, i) => {
            const itemPath = `${path}.${i}`;
            const problems = errorsUnder(errors, itemPath);
            const isOpen = open === i;
            const bodyId = `${itemPath}-body`;
            return (
              <div key={i} className={`${styles.item} ${isOpen ? styles.itemOpen : ""}`}>
                <button
                  type="button"
                  className={styles.itemHeader}
                  aria-expanded={isOpen}
                  aria-controls={bodyId}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className={styles.itemIndex}>{i + 1}</span>
                  {imageField && <ItemThumb name={String(item[imageField.key] ?? "")} />}
                  <span className={styles.itemTitle}>{field.itemTitle(item)}</span>
                  {problems > 0 && (
                    <Badge tone="critical">
                      {problems} {problems === 1 ? "issue" : "issues"}
                    </Badge>
                  )}
                  <span className={styles.itemChevron}>
                    <Icon name="chevronDown" />
                  </span>
                </button>
                {isOpen && (
                  <div className={styles.itemBody} id={bodyId}>
                    <FieldList
                      fields={field.fields}
                      value={item}
                      onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))}
                      path={itemPath}
                      errors={errors}
                    />
                    <div className={styles.itemActions}>
                      <Button icon="chevronUp" label="Move up" disabled={i === 0} onClick={() => move(i, i - 1)} />
                      <Button icon="chevronDown" label="Move down" disabled={i === value.length - 1} onClick={() => move(i, i + 1)} />
                      <Button
                        variant="plainCritical"
                        icon="trash"
                        label={`Remove ${field.itemName}`}
                        disabled={value.length <= min}
                        onClick={() => {
                          onChange(value.filter((_, j) => j !== i));
                          setOpen(null);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <div className={styles.listFooter}>
        {value.length < max ? (
          <Button
            icon="plus"
            label={`Add ${field.itemName}`}
            onClick={() => {
              onChange([...value, field.blank()]);
              setOpen(value.length);
            }}
          />
        ) : (
          <span className={uiStyles.help}>Up to {max} {field.itemName}s.</span>
        )}
        {errors[path] && <span className={uiStyles.error}>{errors[path]}</span>}
      </div>
    </div>
  );
}

function ItemThumb({ name }: { name: string }) {
  const url = useImageUrl(name || null);
  return <Thumbnail src={url} size={36} />;
}
