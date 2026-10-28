"use client";

/* eslint-disable @next/next/no-img-element -- media previews */
import { useMemo, useState } from "react";
import { imageRefs } from "@/content/refs";
import { images as builtImages } from "@/lib/images.generated";
import { formatBytes, useDraft, useImageUrl, type MediaImage } from "../store";
import { DropZone, ImageTile } from "../ui/library";
import { Badge, Button, Card, EmptyState, Modal, Page, TextField, Thumbnail } from "../ui/primitives";
import fieldStyles from "../ui/fields.module.css";
import styles from "./screens.module.css";

/** Every source image and public file, where each is used, uploads and removals. */
export function Media() {
  const { draft, images, publicFiles, addImage, removeImage, removeFile, fileUrl, toast } = useDraft();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "used" | "unused">("all");
  const [open, setOpen] = useState<MediaImage | null>(null);
  const [busy, setBusy] = useState(false);

  const usage = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const [name, where] of imageRefs(draft)) {
      map.set(name, [...new Set([...(map.get(name) ?? []), where])]);
    }
    return map;
  }, [draft]);

  const draftText = useMemo(() => JSON.stringify(draft), [draft]);
  const shown = images.filter((i) => {
    if (query.trim() && !i.name.includes(query.trim().toLowerCase())) return false;
    const used = (usage.get(i.name)?.length ?? 0) > 0;
    return filter === "all" || (filter === "used" ? used : !used);
  });

  const upload = async (files: File[]) => {
    setBusy(true);
    let added = 0;
    for (const file of files) {
      try {
        await addImage(file);
        added++;
      } catch (err) {
        toast(err instanceof Error ? err.message : `Couldn’t add ${file.name}`, "critical");
      }
    }
    setBusy(false);
    if (added) toast(`${added} image${added === 1 ? "" : "s"} added. Save to publish.`);
  };

  return (
    <Page title="Media" subtitle="Images and files used across the site.">
      <div style={{ display: "grid", gap: 16 }}>
        <Card title="Images" description={`${images.length} images. Uploads are optimised for every screen size when the site publishes.`}>
          <div style={{ display: "grid", gap: 16 }}>
            <DropZone
              accept="image/png,image/jpeg,image/webp"
              multiple
              label={busy ? "Adding…" : "Upload images"}
              hint="or drop PNG, JPG or WebP files here. Large photos are scaled to 2560px wide."
              onFiles={upload}
            />
            <div className={fieldStyles.libraryToolbar}>
              <TextField label="Search images" hideLabel type="search" placeholder="Search by name" value={query} onChange={setQuery} />
              <div className={styles.segmented} role="group" aria-label="Filter images">
                {(["all", "used", "unused"] as const).map((f) => (
                  <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
                    {f === "all" ? "All" : f === "used" ? "In use" : "Not used"}
                  </button>
                ))}
              </div>
            </div>
            {shown.length ? (
              <div className={fieldStyles.grid}>
                {shown.map((image) => (
                  <ImageTile key={image.path} image={image} usedBy={usage.get(image.name) ?? []} onClick={() => setOpen(image)} />
                ))}
              </div>
            ) : (
              <EmptyState title="No images match">Try another search or filter.</EmptyState>
            )}
          </div>
        </Card>

        <Card title="Files" description="Résumé, video, icons and the share image. Pick or replace them from the section that uses them." flush>
          <div>
            {publicFiles.map((file) => {
              const used = draftText.includes(`"${file.url}"`);
              const isImage = /\.(png|jpe?g|webp|svg)$/i.test(file.url);
              return (
                <div key={file.path} className={fieldStyles.fileRow} style={{ cursor: "default" }}>
                  <Thumbnail src={isImage ? fileUrl(file.url) : null} size={36} icon="file" />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontWeight: 550 }}>{file.url}</span>
                    <span style={{ color: "var(--a-text-secondary)", fontSize: 12 }}>{formatBytes(file.size)}</span>
                  </span>
                  {file.pending && <Badge tone="info">New</Badge>}
                  {used ? <Badge>In use</Badge> : file.url.startsWith("/uploads/") && (
                    <Button variant="plainCritical" icon="trash" iconOnly label={`Delete ${file.url}`} onClick={() => removeFile(file.url)} />
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {open && (
        <ImageDetail
          image={open}
          usedBy={usage.get(open.name) ?? []}
          onClose={() => setOpen(null)}
          onDelete={() => {
            removeImage(open.name);
            toast(`${open.name} will be deleted when you save`);
            setOpen(null);
          }}
        />
      )}
    </Page>
  );
}

function ImageDetail({
  image,
  usedBy,
  onClose,
  onDelete,
}: {
  image: MediaImage;
  usedBy: string[];
  onClose: () => void;
  onDelete: () => void;
}) {
  const url = useImageUrl(image.name);
  const built = image.name in builtImages ? builtImages[image.name as keyof typeof builtImages] : null;
  return (
    <Modal
      open
      title={image.name}
      large
      onClose={onClose}
      footerStart={usedBy.length ? "Images in use can’t be deleted." : undefined}
      footer={
        <>
          <Button variant="critical" icon="trash" label="Delete image" disabled={usedBy.length > 0} onClick={onDelete} />
          <Button label="Close" onClick={onClose} />
        </>
      }
    >
      <div className={styles.detail}>
        <div className={styles.detailImage}>{url ? <img src={url} alt="" /> : null}</div>
        <dl className={styles.detailList}>
          <div>
            <dt>Name</dt>
            <dd>{image.name}</dd>
          </div>
          <div>
            <dt>Dimensions</dt>
            <dd>{built ? `${built.width} × ${built.height} px` : "Measured when the site publishes"}</dd>
          </div>
          <div>
            <dt>Source file</dt>
            <dd>
              {image.path} · {formatBytes(image.size)}
            </dd>
          </div>
          <div>
            <dt>Used in</dt>
            <dd>{usedBy.length ? usedBy.join(", ") : "Not used on the site"}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              {image.pending ? (
                <Badge tone="info">Uploads when you save</Badge>
              ) : image.built ? (
                <Badge tone="success">Published</Badge>
              ) : (
                <Badge tone="warning">Publishes with the next build</Badge>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </Modal>
  );
}
