import { cmsConfig } from "./config";

// A small client for the GitHub REST API: just what the CMS needs to read
// the repository tree, read file contents, and commit several files at once
// through the Git Data API. Runs in the browser with the editor's token.

const API = "https://api.github.com";

export class GitHubError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export type TreeEntry = { path: string; type: "blob" | "tree"; sha: string; size?: number };

export type FileChange =
  | { path: string; base64: string }
  | { path: string; text: string }
  /** Delete the file. */
  | { path: string; delete: true };

export type WorkflowRun = {
  id: number;
  status: "queued" | "in_progress" | "completed" | "waiting" | "requested" | "pending";
  conclusion: "success" | "failure" | "cancelled" | "skipped" | "timed_out" | null;
  html_url: string;
  head_sha: string;
  created_at: string;
  updated_at: string;
  display_title: string;
};

export type CommitSummary = {
  sha: string;
  html_url: string;
  commit: { message: string; author: { name: string; date: string } };
  author: { login: string; avatar_url: string } | null;
};

export const utf8ToBase64 = (text: string) => {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
};

export const base64ToUtf8 = (b64: string) => {
  const binary = atob(b64.replace(/\s/g, ""));
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
};

export class GitHub {
  private readonly repoPath = `/repos/${cmsConfig.owner}/${cmsConfig.repo}`;

  constructor(private readonly token: string) {}

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${API}${path}`, {
        ...init,
        cache: "no-store",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${this.token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          ...(init.body ? { "Content-Type": "application/json" } : {}),
        },
      });
    } catch {
      throw new GitHubError("Can’t reach GitHub. Check your connection and try again.", 0);
    }
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string };
      throw new GitHubError(describe(res.status, body.message), res.status);
    }
    return (res.status === 204 ? undefined : await res.json()) as T;
  }

  user() {
    return this.request<{ login: string; name: string | null; avatar_url: string }>("/user");
  }

  repository() {
    return this.request<{ permissions?: { push?: boolean }; html_url: string }>(this.repoPath);
  }

  async head() {
    const ref = await this.request<{ object: { sha: string } }>(
      `${this.repoPath}/git/ref/heads/${cmsConfig.branch}`,
    );
    const commit = await this.request<{ tree: { sha: string } }>(
      `${this.repoPath}/git/commits/${ref.object.sha}`,
    );
    return { commit: ref.object.sha, tree: commit.tree.sha };
  }

  async tree(sha: string): Promise<TreeEntry[]> {
    const res = await this.request<{ tree: TreeEntry[]; truncated: boolean }>(
      `${this.repoPath}/git/trees/${sha}?recursive=1`,
    );
    return res.tree;
  }

  async blobBase64(sha: string) {
    const res = await this.request<{ content: string }>(`${this.repoPath}/git/blobs/${sha}`);
    return res.content.replace(/\s/g, "");
  }

  async blobText(sha: string) {
    return base64ToUtf8(await this.blobBase64(sha));
  }

  /**
   * Commits all changes as one commit on top of `parent` and moves the
   * branch to it. Fails (409) if the branch moved on since `parent`.
   */
  async commit(message: string, changes: FileChange[], parent: { commit: string; tree: string }) {
    const tree = await Promise.all(
      changes.map(async (change) => {
        if ("delete" in change) return { path: change.path, mode: "100644", type: "blob", sha: null };
        const content = "base64" in change ? change.base64 : utf8ToBase64(change.text);
        const blob = await this.request<{ sha: string }>(`${this.repoPath}/git/blobs`, {
          method: "POST",
          body: JSON.stringify({ content, encoding: "base64" }),
        });
        return { path: change.path, mode: "100644", type: "blob", sha: blob.sha };
      }),
    );
    const newTree = await this.request<{ sha: string }>(`${this.repoPath}/git/trees`, {
      method: "POST",
      body: JSON.stringify({ base_tree: parent.tree, tree }),
    });
    const commit = await this.request<{ sha: string; html_url: string }>(
      `${this.repoPath}/git/commits`,
      {
        method: "POST",
        body: JSON.stringify({ message, tree: newTree.sha, parents: [parent.commit] }),
      },
    );
    try {
      await this.request(`${this.repoPath}/git/refs/heads/${cmsConfig.branch}`, {
        method: "PATCH",
        body: JSON.stringify({ sha: commit.sha, force: false }),
      });
    } catch (error) {
      if (error instanceof GitHubError && error.status === 422) {
        throw new GitHubError(
          "The site changed on GitHub while you were editing. Reload to get the latest version, then make your changes again.",
          409,
        );
      }
      throw error;
    }
    return { commit: commit.sha, tree: newTree.sha, url: commit.html_url };
  }

  async runs(query: { headSha?: string } = {}) {
    const params = new URLSearchParams({ branch: cmsConfig.branch, per_page: "5" });
    if (query.headSha) params.set("head_sha", query.headSha);
    const res = await this.request<{ workflow_runs: WorkflowRun[] }>(
      `${this.repoPath}/actions/workflows/${cmsConfig.workflow}/runs?${params}`,
    );
    return res.workflow_runs;
  }

  recentCommits(path: string) {
    return this.request<CommitSummary[]>(
      `${this.repoPath}/commits?sha=${cmsConfig.branch}&path=${encodeURIComponent(path)}&per_page=6`,
    );
  }
}

function describe(status: number, message = "") {
  if (status === 401) return "GitHub didn’t accept this token. It may have expired or been revoked.";
  if (status === 403 && /rate limit/i.test(message)) return "GitHub’s rate limit was reached. Try again in a few minutes.";
  if (status === 403) return "This token doesn’t have permission for that. See the setup steps on the login page.";
  if (status === 404) return "Not found on GitHub. The token may not have access to this repository.";
  return message || `GitHub returned an error (${status}).`;
}
