"use client";

import { useRef, useState, type DragEvent } from "react";
import { images as builtImages } from "@/lib/images.generated";
import { formatBytes, useCms, useImageUrl, type MediaImage } from "../store";
import { Icon } from "./Icon";
import { Badge, Button, EmptyState, Modal, TextField, Thumbnail } from "./primitives";
import styles from "./fields.module.css";

// The media library: every source image in the repository plus uploads
// waiting for Save. Used as a picker by image fields and as the Media page.

export function DropZone({
  accept,
  multiple,
  label,
  hint,
  onFiles,
}: {
  accept: string;
  multiple?: boolean;
  label: string;
  hint: string;
  onFiles: (files: File[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(false);
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setActive(false);
    const files = [...e.dataTransfer.files];
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  };
  return (
    <div
      className={styles.drop}
      data-active={active}
      onDragOver={(e) => {
        e.preventDefault();
        setActive(true);
      }}
      onDragLeave={() => setActive(false)}
      onDrop={onDrop}
    >
      <Button icon="upload" label={label} onClick={() => input.current?.click()} />
      <span>{hint}</span>
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = "";
          if (files.length) onFiles(files);
        }}
      />
    </div>
  );
}

function useUploader<T>(upload: (file: File) => Promise<T>) {
  const { toast } = useCms();
  const [busy, setBusy] = useState(false);
  const run = async (files: File[]) => {
    setBusy(true);
    const done: T[] = [];
    for (const file of files) {
      try {
        done.push(await upload(file));
      } catch (err) {
        toast(err instanceof Error ? err.message : `Couldn’t add ${file.name}`, "critical");
      }
    }
    setBusy(false);
    return done;
  };
  return { busy, run };
}

export function ImageTile({
  image,
  selected,
  usedBy,
  onClick,
}: {
  image: MediaImage;
  selected?: boolean;
  usedBy?: string[];
  onClick: () => void;
}) {
  const url = useImageUrl(image.name);
  const built = image.name in builtImages ? builtImages[image.name as keyof typeof builtImages] : null;
  return (
    <button type="button" className={styles.tile} aria-pressed={selected} onClick={onClick}>
      <span className={styles.tileImage}>
        {/* eslint-disable-next-line @next/next/no-img-element -- CMS thumbnails */}
        {url ? <img src={url} alt="" loading="lazy" /> : <Icon name="image" />}
      </span>
      <span className={styles.tileName}>{image.name}</span>
      <span className={styles.tileMeta}>
        {built ? `${built.width} × ${built.height}` : formatBytes(image.size)}
        {usedBy && (usedBy.length ? ` · ${usedBy.join(", ")}` : " · Not used")}
      </span>
      {selected && (
        <span className={styles.tileCheck}>
          <Icon name="check" size={16} />
        </span>
      )}
      {image.pending && (
        <span className={styles.tileBadge}>
          <Badge tone="info">New</Badge>
        </span>
      )}
    </button>
  );
}

type ImagePickerProps = {
  open: boolean;
  title: string;
  selected: string;
  onClose: () => void;
  onSelect: (name: string) => void;
};

/** Mounted only while open, so each opening starts from the current value. */
export function ImagePicker(props: ImagePickerProps) {
  return props.open ? <ImagePickerBody {...props} /> : null;
}

function ImagePickerBody({
  open,
  title,
  selected,
  onClose,
  onSelect,
}: ImagePickerProps) {
  const { images, addImage } = useCms();
  const [query, setQuery] = useState("");
  const [choice, setChoice] = useState(selected);
  const { busy, run } = useUploader(addImage);
  const shown = images.filter((i) => i.name.includes(query.trim().toLowerCase()));

  return (
    <Modal
      open={open}
      title={title}
      large
      onClose={onClose}
      footerStart={`${images.length} images`}
      footer={
        <>
          <Button label="Cancel" onClick={onClose} />
          <Button variant="primary" label="Done" disabled={!choice} onClick={() => onSelect(choice)} />
        </>
      }
    >
      <div className={styles.libraryToolbar}>
        <TextField label="Search images" hideLabel type="search" placeholder="Search images" value={query} onChange={setQuery} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <DropZone
          accept="image/png,image/jpeg,image/webp"
          multiple
          label={busy ? "Adding…" : "Upload images"}
          hint="or drop PNG, JPG or WebP files here. They’re published when you save."
          onFiles={async (files) => {
            const names = await run(files);
            if (names.length) setChoice(names[names.length - 1]);
          }}
        />
      </div>
      {shown.length ? (
        <div className={styles.grid}>
          {shown.map((image) => (
            <ImageTile
              key={image.path}
              image={image}
              selected={choice === image.name}
              onClick={() => setChoice(image.name)}
            />
          ))}
        </div>
      ) : (
        <EmptyState title="No images found">Try a different search.</EmptyState>
      )}
    </Modal>
  );
}

const EXTENSIONS: Record<string, string[]> = {
  "application/pdf": ["pdf"],
  "image/svg+xml": ["svg"],
  "image/png": ["png"],
  "image/jpeg": ["jpg", "jpeg"],
  "image/webp": ["webp"],
  "video/webm": ["webm"],
  "video/mp4": ["mp4"],
};

type FilePickerProps = {
  open: boolean;
  title: string;
  accept: string;
  kind: string;
  selected: string;
  onClose: () => void;
  onSelect: (path: string) => void;
};

export function FilePicker(props: FilePickerProps) {
  return props.open ? <FilePickerBody {...props} /> : null;
}

function FilePickerBody({
  open,
  title,
  accept,
  kind,
  selected,
  onClose,
  onSelect,
}: FilePickerProps) {
  const { publicFiles, addFile, fileUrl } = useCms();
  const [choice, setChoice] = useState(selected);
  const { busy, run } = useUploader(addFile);
  const extensions = accept.split(",").flatMap((type) => EXTENSIONS[type.trim()] ?? []);
  const files = publicFiles.filter((f) => extensions.some((ext) => f.url.toLowerCase().endsWith(`.${ext}`)));

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button label="Cancel" onClick={onClose} />
          <Button variant="primary" label="Done" disabled={!choice} onClick={() => onSelect(choice)} />
        </>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <DropZone
          accept={accept}
          label={busy ? "Adding…" : `Upload ${kind}`}
          hint={`or drop a ${extensions.map((e) => e.toUpperCase()).join(" or ")} file here.`}
          onFiles={async (picked) => {
            const paths = await run(picked);
            if (paths.length) setChoice(paths[0]);
          }}
        />
      </div>
      {files.length ? (
        <div className={styles.list}>
          {files.map((file) => (
            <button
              key={file.path}
              type="button"
              className={styles.fileRow}
              aria-pressed={choice === file.url}
              onClick={() => setChoice(file.url)}
            >
              <Thumbnail
                src={/\.(png|jpe?g|webp|svg)$/i.test(file.url) ? fileUrl(file.url) : null}
                size={36}
                icon="file"
              />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 550 }}>{file.url.slice(file.url.lastIndexOf("/") + 1)}</span>
                <span style={{ color: "var(--a-text-secondary)", fontSize: 12 }}>
                  {file.url} · {formatBytes(file.size)}
                </span>
              </span>
              {file.pending && <Badge tone="info">New</Badge>}
              {choice === file.url && <Icon name="check" />}
            </button>
          ))}
        </div>
      ) : (
        <EmptyState title={`No ${kind} files yet`}>Upload one above.</EmptyState>
      )}
    </Modal>
  );
}
