"use client";

import { useEffect, useState } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import type { SiteContentMap } from "@/content/types";
import { previewImages } from "@/lib/preview-images";
import { HomeSections } from "@/sections/HomeSections";

type Message = {
  type: "cms-preview";
  content: SiteContentMap;
  /** Image name → URL, for images the build doesn't have yet. */
  images: Record<string, string>;
  /** Public path → URL, for files waiting for Save. */
  files: Record<string, string>;
  anchor?: string;
};

/** Swaps file paths for their in-memory uploads, anywhere in the content. */
function withFiles<T>(value: T, files: Record<string, string>): T {
  if (typeof value === "string") return (files[value] ?? value) as T;
  if (Array.isArray(value)) return value.map((v) => withFiles(v, files)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, withFiles(v, files)])) as T;
  }
  return value;
}

/**
 * The homepage rendered from the CMS draft, posted in by the editor
 * (same origin only). Links don't navigate away from the preview.
 */
export function PreviewDocument() {
  const [state, setState] = useState<{ content: SiteContentMap; anchor?: string } | null>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent<Message>) => {
      if (e.origin !== window.location.origin || e.data?.type !== "cms-preview") return;
      previewImages.clear();
      for (const [name, url] of Object.entries(e.data.images)) previewImages.set(name, url);
      setState({ content: withFiles(e.data.content, e.data.files), anchor: e.data.anchor });
    };
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element).closest("a");
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      e.preventDefault();
      if (href.startsWith("#")) document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" });
    };
    window.addEventListener("message", onMessage);
    document.addEventListener("click", onClick, true);
    window.parent.postMessage({ type: "cms-preview-ready" }, window.location.origin);
    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  // Jump to the section being edited when it changes, not on every keystroke.
  const anchor = state?.anchor;
  const loaded = Boolean(state);
  useEffect(() => {
    if (!loaded || !anchor) return;
    const target = document.getElementById(anchor);
    if (target) window.scrollTo({ top: anchor === "top" ? 0 : target.offsetTop, behavior: "instant" });
  }, [anchor, loaded]);

  if (!state) return null;
  const { content } = state;
  return (
    <>
      <SiteHeader name={content.site.name} nav={content.site.nav} />
      <main id="main">
        <HomeSections content={content} />
      </main>
      <SiteFooter content={content.footer} site={content.site} projects={content.work.projects} />
    </>
  );
}
