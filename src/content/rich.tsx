import type { ReactNode } from "react";

/** A title line set entirely in the accent colour: "*whole line*". */
export function wholeAccent(line: string): string | null {
  const m = /^\*([^*]+)\*$/.exec(line.trim());
  return m ? m[1] : null;
}

/** Renders "*words*" in a line as accent spans; everything else is plain text. */
export function Accented({ text, className }: { text: string; className?: string }): ReactNode {
  const parts = text.split(/\*([^*]+)\*/);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 ? (
      <span key={i} className={className}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/** Mobile wording when set, otherwise the desktop copy. */
export const orDesktop = (mobile: string, desktop: string) => mobile.trim() || desktop;
