"use client";

import type { ReactNode } from "react";
import { Frame } from "./Frame";
import { LoadingScreen, Login } from "./Login";
import { CmsProvider, useCms } from "./store";
import { Banner, Button } from "./ui/primitives";
import styles from "./Login.module.css";

/** Signs the editor in, loads content from GitHub, then shows the admin. */
export function AdminApp({ children }: { children: ReactNode }) {
  return (
    <CmsProvider>
      <Gate>{children}</Gate>
    </CmsProvider>
  );
}

function Gate({ children }: { children: ReactNode }) {
  const { phase, error, reload, signOut } = useCms();

  if (phase === "boot") return <LoadingScreen label="Starting…" />;
  if (phase === "signed-out") return <Login />;
  if (phase === "loading") return <LoadingScreen label="Loading your content from GitHub…" />;
  if (phase === "error") {
    return (
      <div className={styles.screen}>
        <div className={styles.column}>
          <Banner
            tone="critical"
            title="The content couldn’t be loaded"
            actions={
              <>
                <Button label="Try again" onClick={() => void reload()} />
                <Button variant="plain" label="Log out" onClick={signOut} />
              </>
            }
          >
            {error}
          </Banner>
        </div>
      </div>
    );
  }
  return <Frame>{children}</Frame>;
}
