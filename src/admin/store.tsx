"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ContentKey, SiteContentMap } from "@/content/types";
import { basePath } from "@/lib/base-path";
import { images as builtImages } from "@/lib/images.generated";
import { cmsConfig } from "./config";
import { GitHub, GitHubError, type FileChange, type TreeEntry, type WorkflowRun } from "./github";
import { sectionById } from "./schema";

// Everything the CMS knows: who is signed in, the repository tree, the saved
// content and the working draft, files waiting to be uploaded, and the
// status of the latest publish. Saving commits every change in one commit;
// the deploy workflow then rebuilds the site.

const TOKEN_KEY = "cms-github-token";
const CONTENT_KEYS: ContentKey[] = [
  "site", "hero", "about", "journey", "work", "expertise", "philosophy", "process", "signature", "contact", "footer", "clients",
];
const IMAGE_SOURCE = /\.(png|jpe?g|webp)$/i;
const BUILT_VARIANT = /-\d+\.(avif|webp)$/;
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const MAX_IMAGE_WIDTH = 2560;

export type Phase = "boot" | "signed-out" | "loading" | "ready" | "error";

export type User = { login: string; name: string | null; avatar: string };

export type Upload = {
  /** Repository path it will be committed to. */
  path: string;
  base64: string;
  /** Object URL for previews. */
  url: string;
  size: number;
  kind: "image" | "file";
};

export type MediaImage = {
  name: string;
  path: string;
  size: number;
  /** Waiting for Save. */
  pending: boolean;
  /** Variants exist in this build of the site. */
  built: boolean;
};

export type PublicFile = { path: string; url: string; size: number; pending: boolean };

export type DeployStatus = "queued" | "building" | "live" | "failed" | "cancelled" | "unknown";
export type Deploy = { sha: string; status: DeployStatus; url?: string; at?: string };

export type Toast = { id: number; message: string; tone: "default" | "critical" };

type Cms = {
  phase: Phase;
  error: string | null;
  user: User | null;
  saved: SiteContentMap | null;
  draft: SiteContentMap | null;
  tree: TreeEntry[];
  uploads: Upload[];
  deletions: string[];
  dirtyIds: ContentKey[];
  dirty: boolean;
  saving: boolean;
  saveError: string | null;
  /** A save was refused for empty required fields: show them all. */
  showRequired: boolean;
  setShowRequired: (show: boolean) => void;
  deploy: Deploy | null;
  images: MediaImage[];
  publicFiles: PublicFile[];
  toasts: Toast[];
  github: GitHub | null;
  signIn: (token: string, remember: boolean) => Promise<void>;
  signOut: () => void;
  reload: () => Promise<void>;
  setSection: (id: ContentKey, value: unknown) => void;
  addImage: (file: File) => Promise<string>;
  addFile: (file: File) => Promise<string>;
  removeImage: (name: string) => void;
  removeFile: (url: string) => void;
  discard: () => void;
  save: () => Promise<boolean>;
  toast: (message: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: number) => void;
  imageUrl: (name: string) => string | null;
  loadImage: (name: string) => Promise<string | null>;
  fileUrl: (path: string) => string;
};

const CmsContext = createContext<Cms | null>(null);

export function useCms() {
  const cms = useContext(CmsContext);
  if (!cms) throw new Error("useCms must be used inside <CmsProvider>");
  return cms;
}

/** The draft and helpers, for screens that only render once content is loaded. */
export function useDraft() {
  const cms = useCms();
  if (!cms.draft || !cms.saved) throw new Error("Content isn't loaded yet");
  return { ...cms, draft: cms.draft, saved: cms.saved };
}

const readToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const storeToken = (token: string | null, remember = false) => {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
    if (token) (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  } catch {
    // Storage blocked: the session lasts until the tab closes.
  }
};

export const slugify = (text: string) =>
  text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "file";

const extension = (name: string) => (/\.([a-z0-9]+)$/i.exec(name)?.[1] ?? "").toLowerCase();

const builtUrl = (name: string) => {
  if (!(name in builtImages)) return null;
  const { widths } = builtImages[name as keyof typeof builtImages];
  const width = widths.find((w) => w >= 400) ?? widths[widths.length - 1];
  return `${basePath}/images/${name}-${width}.webp`;
};

const blobToBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

/** Scales very large photos down before they go into the repository. */
async function prepareImage(file: File): Promise<Blob> {
  if (file.type === "image/svg+xml") return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) throw new Error(`“${file.name}” couldn’t be read as an image.`);
  if (bitmap.width <= MAX_IMAGE_WIDTH) {
    bitmap.close();
    return file;
  }
  const scale = MAX_IMAGE_WIDTH / bitmap.width;
  const canvas = document.createElement("canvas");
  canvas.width = MAX_IMAGE_WIDTH;
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const type = file.type === "image/png" || file.type === "image/webp" ? file.type : "image/jpeg";
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Couldn’t resize the image."))), type, 0.9),
  );
}

const typeExtension: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

function toDeploy(run: WorkflowRun | undefined, sha: string): Deploy {
  if (!run) return { sha, status: "queued" };
  const status: DeployStatus =
    run.status !== "completed"
      ? run.status === "queued" || run.status === "pending" || run.status === "waiting" || run.status === "requested"
        ? "queued"
        : "building"
      : run.conclusion === "success"
        ? "live"
        : run.conclusion === "cancelled" || run.conclusion === "skipped"
          ? "cancelled"
          : "failed";
  return { sha, status, url: run.html_url, at: run.updated_at };
}

export function CmsProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("boot");
  const [error, setError] = useState<string | null>(null);
  const [github, setGithub] = useState<GitHub | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [head, setHead] = useState<{ commit: string; tree: string } | null>(null);
  const [tree, setTree] = useState<TreeEntry[]>([]);
  const [saved, setSaved] = useState<SiteContentMap | null>(null);
  const [draft, setDraft] = useState<SiteContentMap | null>(null);
  const [shas, setShas] = useState<Partial<Record<ContentKey, string>>>({});
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [deletions, setDeletions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showRequired, setShowRequired] = useState(false);
  const [deploy, setDeploy] = useState<Deploy | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [fetched, setFetched] = useState<Record<string, string>>({});
  // Images committed in this session keep their local preview until a
  // deploy builds them.
  const recent = useRef(new Map<string, string>());
  const loading = useRef(new Map<string, Promise<string | null>>());

  const toast = useCallback((message: string, tone: Toast["tone"] = "default") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === "critical" ? 8000 : 4000);
  }, []);

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const shasFrom = (entries: TreeEntry[]) =>
    Object.fromEntries(
      CONTENT_KEYS.map((key) => [key, entries.find((e) => e.path === `${cmsConfig.contentDir}/${key}.json`)?.sha]),
    ) as Partial<Record<ContentKey, string>>;

  const load = useCallback(async (gh: GitHub) => {
    setPhase("loading");
    setError(null);
    try {
      const [me, repo] = await Promise.all([gh.user(), gh.repository()]);
      if (!repo.permissions?.push) {
        throw new GitHubError(
          `@${me.login} can read ${cmsConfig.owner}/${cmsConfig.repo} but can’t save to it. Give the token “Contents: Read and write” access.`,
          403,
        );
      }
      const current = await gh.head();
      const entries = await gh.tree(current.tree);
      const fileShas = shasFrom(entries);
      const missing = CONTENT_KEYS.filter((k) => !fileShas[k]);
      if (missing.length) {
        throw new GitHubError(
          `The content files aren’t on GitHub yet (${missing.map((k) => `${k}.json`).join(", ")}). Push the CMS update to the repository first.`,
          404,
        );
      }
      const texts = await Promise.all(CONTENT_KEYS.map((k) => gh.blobText(fileShas[k]!)));
      const content = Object.fromEntries(CONTENT_KEYS.map((k, i) => [k, JSON.parse(texts[i])])) as SiteContentMap;

      setUser({ login: me.login, name: me.name, avatar: me.avatar_url });
      setHead(current);
      setTree(entries);
      setShas(fileShas);
      setSaved(content);
      setDraft(structuredClone(content));
      setUploads([]);
      setDeletions([]);
      setSaveError(null);
      setPhase("ready");

      gh.runs()
        .then((runs) => setDeploy(runs[0] ? toDeploy(runs[0], runs[0].head_sha) : null))
        .catch(() => setDeploy(null));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (err instanceof GitHubError && err.status === 401) {
        storeToken(null);
        setGithub(null);
        setPhase("signed-out");
        setError(message);
        return;
      }
      setError(message);
      setPhase("error");
    }
  }, []);

  // Storage is only readable after hydration, so start on the next tick.
  useEffect(() => {
    void Promise.resolve().then(() => {
      const token = readToken();
      if (!token) {
        setPhase("signed-out");
        return;
      }
      const gh = new GitHub(token);
      setGithub(gh);
      return load(gh);
    });
  }, [load]);

  const signIn = useCallback(
    async (token: string, remember: boolean) => {
      const gh = new GitHub(token.trim());
      storeToken(token.trim(), remember);
      setGithub(gh);
      await load(gh);
    },
    [load],
  );

  const signOut = useCallback(() => {
    storeToken(null);
    setGithub(null);
    setUser(null);
    setSaved(null);
    setDraft(null);
    setUploads([]);
    setDeletions([]);
    setDeploy(null);
    setError(null);
    setPhase("signed-out");
  }, []);

  const reload = useCallback(async () => {
    if (github) await load(github);
  }, [github, load]);

  const dirtyIds = useMemo(
    () =>
      draft && saved
        ? CONTENT_KEYS.filter((k) => JSON.stringify(draft[k]) !== JSON.stringify(saved[k]))
        : [],
    [draft, saved],
  );
  const dirty = dirtyIds.length > 0 || uploads.length > 0 || deletions.length > 0;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const setSection = useCallback((id: ContentKey, value: unknown) => {
    setSaveError(null);
    setDraft((d) => (d ? { ...d, [id]: value } : d));
  }, []);

  const images = useMemo<MediaImage[]>(() => {
    const inRepo = tree
      .filter(
        (e) =>
          e.type === "blob" &&
          cmsConfig.imageDirs.some((dir) => e.path.startsWith(`${dir}/`)) &&
          IMAGE_SOURCE.test(e.path) &&
          !deletions.includes(e.path),
      )
      .map((e) => {
        const name = e.path.slice(e.path.lastIndexOf("/") + 1).replace(/\.[^.]+$/, "");
        return { name, path: e.path, size: e.size ?? 0, pending: false, built: name in builtImages };
      });
    const pending = uploads
      .filter((u) => u.kind === "image")
      .map((u) => ({
        name: u.path.slice(u.path.lastIndexOf("/") + 1).replace(/\.[^.]+$/, ""),
        path: u.path,
        size: u.size,
        pending: true,
        built: false,
      }));
    return [...pending, ...inRepo];
  }, [tree, uploads, deletions]);

  const publicFiles = useMemo<PublicFile[]>(() => {
    const prefix = `${cmsConfig.publicDir}/`;
    const inRepo = tree
      .filter(
        (e) =>
          e.type === "blob" &&
          e.path.startsWith(prefix) &&
          !(e.path.startsWith(`${cmsConfig.builtImageDir}/`) && BUILT_VARIANT.test(e.path)) &&
          !/(^|\/)\.[^/]+$/.test(e.path) &&
          !deletions.includes(e.path),
      )
      .map((e) => ({ path: e.path, url: e.path.slice(cmsConfig.publicDir.length), size: e.size ?? 0, pending: false }));
    const pending = uploads
      .filter((u) => u.kind === "file")
      .map((u) => ({ path: u.path, url: u.path.slice(cmsConfig.publicDir.length), size: u.size, pending: true }));
    return [...pending, ...inRepo];
  }, [tree, uploads, deletions]);

  const imageUrl = useCallback(
    (name: string) => {
      const upload = uploads.find((u) => u.kind === "image" && u.path.replace(/^.*\/|\.[^.]+$/g, "") === name);
      return upload?.url ?? recent.current.get(name) ?? builtUrl(name) ?? fetched[name] ?? null;
    },
    [uploads, fetched],
  );

  const loadImage = useCallback(
    async (name: string) => {
      const known = imageUrl(name);
      if (known) return known;
      const entry = images.find((i) => i.name === name && !i.pending);
      const sha = entry && tree.find((e) => e.path === entry.path)?.sha;
      if (!github || !entry || !sha) return null;
      let pending = loading.current.get(name);
      if (!pending) {
        const ext = extension(entry.path);
        const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`;
        pending = github
          .blobBase64(sha)
          .then((b64) => {
            const url = `data:${mime};base64,${b64}`;
            setFetched((f) => ({ ...f, [name]: url }));
            return url;
          })
          .catch(() => null);
        loading.current.set(name, pending);
      }
      return pending;
    },
    [github, images, imageUrl, tree],
  );

  const fileUrl = useCallback(
    (path: string) => uploads.find((u) => u.kind === "file" && u.path === `${cmsConfig.publicDir}${path}`)?.url ?? `${basePath}${path}`,
    [uploads],
  );

  const addImage = useCallback(
    async (file: File) => {
      if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
        throw new Error(`“${file.name}” isn’t a PNG, JPG or WebP image.`);
      }
      if (file.size > MAX_UPLOAD_BYTES) throw new Error(`“${file.name}” is larger than 25 MB.`);
      const blob = await prepareImage(file);
      const taken = new Set([...images.map((i) => i.name), ...Object.keys(builtImages)]);
      const base = slugify(file.name.replace(/\.[^.]+$/, ""));
      let name = base;
      for (let n = 2; taken.has(name); n++) name = `${base}-${n}`;
      const path = `${cmsConfig.uploadImageDir}/${name}.${typeExtension[blob.type] ?? extension(file.name)}`;
      const upload: Upload = { path, base64: await blobToBase64(blob), url: URL.createObjectURL(blob), size: blob.size, kind: "image" };
      setUploads((u) => [...u, upload]);
      return name;
    },
    [images],
  );

  const addFile = useCallback(
    async (file: File) => {
      if (file.size > MAX_UPLOAD_BYTES) throw new Error(`“${file.name}” is larger than 25 MB.`);
      const ext = extension(file.name);
      const base = slugify(file.name.replace(/\.[^.]+$/, ""));
      const taken = new Set(publicFiles.map((f) => f.path));
      let path = `${cmsConfig.uploadFileDir}/${base}.${ext}`;
      for (let n = 2; taken.has(path); n++) path = `${cmsConfig.uploadFileDir}/${base}-${n}.${ext}`;
      const upload: Upload = { path, base64: await blobToBase64(file), url: URL.createObjectURL(file), size: file.size, kind: "file" };
      setUploads((u) => [...u, upload]);
      return path.slice(cmsConfig.publicDir.length);
    },
    [publicFiles],
  );

  const removeImage = useCallback(
    (name: string) => {
      const image = images.find((i) => i.name === name);
      if (!image) return;
      if (image.pending) {
        setUploads((u) => u.filter((x) => x.path !== image.path));
        return;
      }
      const variants = tree
        .filter((e) => /^-\d+\.(avif|webp)$/.test(e.path.slice(`${cmsConfig.builtImageDir}/${name}`.length)) && e.path.startsWith(`${cmsConfig.builtImageDir}/${name}-`))
        .map((e) => e.path);
      setDeletions((d) => [...new Set([...d, image.path, ...variants])]);
    },
    [images, tree],
  );

  const removeFile = useCallback((url: string) => {
    const path = `${cmsConfig.publicDir}${url}`;
    setUploads((u) => u.filter((x) => x.path !== path));
    if (tree.some((e) => e.path === path)) setDeletions((d) => [...new Set([...d, path])]);
  }, [tree]);

  const discard = useCallback(() => {
    if (saved) setDraft(structuredClone(saved));
    setUploads([]);
    setDeletions([]);
    setSaveError(null);
    setShowRequired(false);
  }, [saved]);

  const save = useCallback(async () => {
    if (!github || !draft || !head || saving) return false;
    setSaving(true);
    setSaveError(null);
    try {
      // Refuse to overwrite edits someone made on GitHub since we loaded.
      const latest = await github.head();
      if (latest.commit !== head.commit) {
        const latestShas = shasFrom(await github.tree(latest.tree));
        const clashing = dirtyIds.filter((k) => latestShas[k] !== shas[k]);
        if (clashing.length) {
          throw new GitHubError(
            `${clashing.map((k) => sectionById(k)?.title ?? k).join(", ")} changed on GitHub since you opened the editor. Reload to get the latest version, then make your changes again.`,
            409,
          );
        }
      }

      const changes: FileChange[] = [
        ...dirtyIds.map((k) => ({ path: `${cmsConfig.contentDir}/${k}.json`, text: `${JSON.stringify(draft[k], null, 2)}\n` })),
        ...uploads.map((u) => ({ path: u.path, base64: u.base64 })),
        ...deletions.map((path) => ({ path, delete: true as const })),
      ];
      const titles = dirtyIds.map((k) => sectionById(k)?.title ?? k);
      const files = uploads.length + deletions.length;
      const message = titles.length
        ? `Update ${titles.join(", ")} from the CMS`
        : `Update ${files} media file${files === 1 ? "" : "s"} from the CMS`;

      const result = await github.commit(message, changes, latest);
      const entries = await github.tree(result.tree);

      for (const u of uploads) {
        if (u.kind === "image") recent.current.set(u.path.replace(/^.*\/|\.[^.]+$/g, ""), u.url);
      }
      setHead({ commit: result.commit, tree: result.tree });
      setTree(entries);
      setShas(shasFrom(entries));
      setSaved(structuredClone(draft));
      setUploads([]);
      setDeletions([]);
      setDeploy({ sha: result.commit, status: "queued" });
      setShowRequired(false);
      toast("Saved. Publishing to your site…");
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setSaveError(message);
      toast("Couldn’t save your changes", "critical");
      return false;
    } finally {
      setSaving(false);
    }
  }, [github, draft, head, saving, dirtyIds, shas, uploads, deletions, toast]);

  // Follow the deploy workflow for the latest save until it finishes.
  const deploySha = deploy?.sha;
  const deployDone = !deploy || ["live", "failed", "cancelled", "unknown"].includes(deploy.status);
  useEffect(() => {
    if (!github || !deploySha || deployDone) return;
    let stopped = false;
    const started = Date.now();
    const poll = async () => {
      try {
        const runs = await github.runs({ headSha: deploySha });
        if (!stopped) setDeploy(toDeploy(runs[0], deploySha));
      } catch {
        if (!stopped) setDeploy({ sha: deploySha, status: "unknown" });
      }
    };
    const timer = setInterval(() => {
      if (Date.now() - started > 15 * 60_000) setDeploy((d) => (d ? { ...d, status: "unknown" } : d));
      else void poll();
    }, 8000);
    void poll();
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [github, deploySha, deployDone]);

  const value: Cms = {
    phase,
    error,
    user,
    saved,
    draft,
    tree,
    uploads,
    deletions,
    dirtyIds,
    dirty,
    saving,
    saveError,
    showRequired,
    setShowRequired,
    deploy,
    images,
    publicFiles,
    toasts,
    github,
    signIn,
    signOut,
    reload,
    setSection,
    addImage,
    addFile,
    removeImage,
    removeFile,
    discard,
    save,
    toast,
    dismissToast,
    imageUrl,
    loadImage,
    fileUrl,
  };

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

/** An image's preview URL, fetching it from GitHub if this build doesn't have it. */
export function useImageUrl(name: string | null | undefined) {
  const { imageUrl, loadImage } = useCms();
  const url = name ? imageUrl(name) : null;
  useEffect(() => {
    if (name && !url) void loadImage(name);
  }, [name, url, loadImage]);
  return url;
}

export const formatBytes = (bytes: number) =>
  bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
