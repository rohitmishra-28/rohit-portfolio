"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { imageRefs } from "@/content/refs";
import { basePath } from "@/lib/base-path";
import { images as builtImages } from "@/lib/images.generated";
import { useDraft } from "../store";
import { Button } from "../ui/primitives";
import { Icon } from "../ui/Icon";
import styles from "./screens.module.css";

const DESKTOP_WIDTH = 1280;
const MOBILE_WIDTH = 390;

/**
 * The real homepage, rendered from the draft in an iframe (/admin/preview)
 * so its own breakpoints apply. Updates as you type; scrolls to `anchor`.
 */
export function PreviewPane({ anchor }: { anchor?: string }) {
  const { draft, uploads, imageUrl, loadImage } = useDraft();
  const frame = useRef<HTMLIFrameElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [ready, setReady] = useState(false);
  const [box, setBox] = useState({ width: 800, height: 600 });
  const [nonce, setNonce] = useState(0);

  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setBox({ width: entry.contentRect.width, height: entry.contentRect.height }),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data?.type === "cms-preview-ready") setReady(true);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Images the build doesn't have yet are sent as URLs the preview can load.
  const missing = imageRefs(draft).map(([name]) => name).filter((name) => name && !(name in builtImages));
  const missingKey = [...new Set(missing)].join("|");
  const [extraImages, setExtraImages] = useState<Record<string, string>>({});
  useEffect(() => {
    let live = true;
    const names = missingKey ? missingKey.split("|") : [];
    void Promise.all(names.map(async (name) => [name, imageUrl(name) ?? (await loadImage(name))] as const)).then(
      (pairs) => live && setExtraImages(Object.fromEntries(pairs.filter(([, url]) => url)) as Record<string, string>),
    );
    return () => {
      live = false;
    };
  }, [missingKey, imageUrl, loadImage]);

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      // Files waiting for Save (video, icons…) preview from memory.
      const files = Object.fromEntries(
        uploads.filter((u) => u.kind === "file").map((u) => [u.path.slice("public".length), u.url]),
      );
      frame.current?.contentWindow?.postMessage(
        { type: "cms-preview", content: draft, images: extraImages, files, anchor },
        window.location.origin,
      );
    }, 120);
    return () => clearTimeout(timer);
  }, [ready, draft, extraImages, uploads, anchor]);

  const width = device === "desktop" ? DESKTOP_WIDTH : MOBILE_WIDTH;
  const scale = device === "desktop" ? Math.min(1, box.width / DESKTOP_WIDTH) : Math.min(1, (box.height - 32) / 800);
  const height = device === "desktop" ? box.height / scale : Math.min(844, (box.height - 32) / scale);

  return (
    <div className={styles.previewPane}>
      <div className={styles.previewToolbar}>
        <div className={styles.segmented} role="group" aria-label="Preview size">
          <button type="button" aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")}>
            <Icon name="desktop" size={16} />
            Desktop
          </button>
          <button type="button" aria-pressed={device === "mobile"} onClick={() => setDevice("mobile")}>
            <Icon name="mobile" size={16} />
            Mobile
          </button>
        </div>
        <span style={{ color: "var(--a-text-secondary)", fontSize: 12 }}>
          Live preview · animations off
        </span>
        <Button
          variant="plain"
          icon="refresh"
          iconOnly
          label="Reload preview"
          onClick={() => {
            setReady(false);
            setNonce((n) => n + 1);
          }}
        />
      </div>
      <div className={styles.previewStage} ref={stage}>
        <iframe
          key={nonce}
          ref={frame}
          title="Live preview of the homepage"
          src={`${basePath}/admin/preview`}
          className={`${styles.previewFrame} ${device === "mobile" ? styles.previewMobile : ""}`}
          style={{ width, height, transform: `translateX(-50%) scale(${scale})` }}
        />
      </div>
    </div>
  );
}
