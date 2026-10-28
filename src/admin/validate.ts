import type { Field, SectionDef } from "./schema";

// Checks a section draft against its schema. Errors are keyed by the
// field's path, e.g. "projects.1.href", so each editor can show its own.

export type Errors = Record<string, string>;

const LINK = /^(#[\w-]*|https?:\/\/[^\s]+\.[^\s]+|mailto:[^\s@]+@[^\s@]+|tel:\+?[\d\s-]+|\/[^\s]*|site:(resume|email|linkedin|github))$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function linkProblem(value: string): string | null {
  if (!value.trim()) return null;
  if (!LINK.test(value.trim())) {
    if (/^www\./.test(value.trim())) return "Start the address with https://";
    return "Use a full address (https://…), a section (#about), an email (mailto:…) or a file path (/resume.pdf).";
  }
  return null;
}

function check(field: Field, value: unknown, path: string, errors: Errors, required: boolean) {
  const empty = value == null || (typeof value === "string" && !value.trim());
  switch (field.type) {
    case "text":
    case "image":
    case "file":
    case "select":
      if (required && empty && !field.optional) errors[path] = `${field.label} can’t be empty.`;
      if (field.type === "text" && field.key === "email" && !empty && !EMAIL.test(String(value))) {
        errors[path] = "Enter a valid email address.";
      }
      break;
    case "link": {
      if (required && empty && !field.optional) errors[path] = `${field.label} can’t be empty.`;
      const problem = typeof value === "string" ? linkProblem(value) : null;
      if (problem) errors[path] = problem;
      break;
    }
    case "lines": {
      const lines = Array.isArray(value) ? (value as string[]) : [];
      if (required && !lines.some((l) => l.trim())) errors[path] = `${field.label} needs at least one line.`;
      lines.forEach((line, i) => {
        if (((line.match(/\*/g) ?? []).length) % 2) errors[`${path}.${i}`] = "An *asterisk* is missing its partner.";
      });
      break;
    }
    case "group":
      for (const f of field.fields) {
        check(f, (value as Record<string, unknown>)?.[f.key], `${path}.${f.key}`, errors, required);
      }
      break;
    case "list": {
      const items = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
      if (required && field.min && items.length < field.min) {
        errors[path] = `Add at least ${field.min} ${field.itemName}${field.min === 1 ? "" : "s"}.`;
      }
      items.forEach((item, i) => {
        for (const f of field.fields) check(f, item[f.key], `${path}.${i}.${f.key}`, errors, required);
      });
      break;
    }
  }
}

/**
 * `required: false` skips "can't be empty" checks, so a new item isn't red
 * before the editor has had a chance to fill it in; format problems
 * (links, email, asterisks) always show.
 */
export function validateSection(def: SectionDef, value: unknown, { required = true } = {}): Errors {
  const errors: Errors = {};
  for (const card of def.cards) {
    for (const field of card.fields) {
      check(field, (value as Record<string, unknown>)?.[field.key], field.key, errors, required);
    }
  }
  return errors;
}

/** Errors at or below a path, e.g. to flag a collapsed list item. */
export const errorsUnder = (errors: Errors, path: string) =>
  Object.keys(errors).filter((k) => k === path || k.startsWith(`${path}.`)).length;
