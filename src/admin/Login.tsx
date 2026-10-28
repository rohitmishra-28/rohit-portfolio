"use client";

/* eslint-disable @next/next/no-img-element -- brand mark */
import { useState, type FormEvent } from "react";
import { asset } from "@/lib/base-path";
import { cmsConfig } from "./config";
import { useCms } from "./store";
import { Icon } from "./ui/Icon";
import { Banner, Button, Checkbox, Spinner, TextField } from "./ui/primitives";
import styles from "./Login.module.css";

const NEW_TOKEN_URL = "https://github.com/settings/personal-access-tokens/new";

/** Sign in with a fine-grained GitHub token scoped to this repository. */
export function Login() {
  const { signIn, error, phase } = useCms();
  const [token, setToken] = useState("");
  const [remember, setRemember] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const busy = phase === "loading";

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const value = token.trim();
    if (!/^(github_pat_|ghp_|gho_)[A-Za-z0-9_]+$/.test(value)) {
      setProblem("That doesn’t look like a GitHub token. It starts with github_pat_.");
      return;
    }
    setProblem(null);
    await signIn(value, remember);
  };

  return (
    <div className={styles.screen}>
      <div className={styles.column}>
        <div className={styles.card}>
          <img src={asset("/brand/monogram-primary.svg")} alt="" className={styles.logo} />
          <div>
            <h1 className={styles.title}>Log in</h1>
            <p className={styles.subtitle}>to edit your portfolio’s content</p>
          </div>
          {error && phase === "signed-out" && <Banner tone="critical">{error}</Banner>}
          <form className={styles.form} onSubmit={submit} noValidate>
            <TextField
              label="GitHub access token"
              type="password"
              value={token}
              onChange={setToken}
              placeholder="github_pat_…"
              autoComplete="off"
              error={problem ?? undefined}
              help={`Saves go to ${cmsConfig.owner}/${cmsConfig.repo} on GitHub as commits by you.`}
              autoFocus
              monospace
            />
            <Checkbox label="Remember me on this device" checked={remember} onChange={setRemember} />
            <Button type="submit" variant="primary" size="large" fullWidth label={busy ? "Checking…" : "Log in"} loading={busy} />
          </form>
        </div>

        <details className={styles.steps}>
          <summary>
            <Icon name="key" />
            How to get a token
            <Icon name="chevronDown" />
          </summary>
          <ol className={styles.stepList}>
            <li>
              Open{" "}
              <a href={NEW_TOKEN_URL} target="_blank" rel="noreferrer">
                GitHub › Fine-grained tokens › Generate new token
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
              .
            </li>
            <li>Name it “Portfolio CMS” and pick an expiry (90 days is a good balance).</li>
            <li>
              Under <strong>Repository access</strong>, choose <em>Only select repositories</em> and pick{" "}
              <strong>{cmsConfig.repo}</strong>.
            </li>
            <li>
              Under <strong>Permissions › Repository permissions</strong>, set <strong>Contents</strong> to{" "}
              <em>Read and write</em> and <strong>Actions</strong> to <em>Read-only</em> (for publish status).
            </li>
            <li>Generate the token, copy it and paste it above.</li>
          </ol>
        </details>

        <p className={styles.footnote}>
          The token stays in this browser and is only sent to GitHub. “Remember me” keeps it after you close the tab.
        </p>
      </div>
    </div>
  );
}

export function LoadingScreen({ label }: { label: string }) {
  return (
    <div className={styles.screen}>
      <div className={styles.loading}>
        <Spinner size={28} />
        <p>{label}</p>
      </div>
    </div>
  );
}
