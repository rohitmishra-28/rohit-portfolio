"use client";

import { useState } from "react";
import type { ContentKey } from "@/content/types";
import { cmsConfig } from "../config";
import { sectionById, type Field } from "../schema";
import { useDraft } from "../store";
import { FieldList } from "../ui/fields";
import { Badge, Banner, Button, ButtonLink, Card, Layout, Page } from "../ui/primitives";
import { validateSection } from "../validate";
import { PublishStatus } from "./Home";
import { PreviewPane } from "./Preview";
import styles from "./screens.module.css";

const hasLines = (fields: Field[]): boolean =>
  fields.some((f) => f.type === "lines" || (f.type === "list" && hasLines(f.fields)));

/** Edits one content file, card by card, with an optional live preview. */
export function SectionEditor({ id }: { id: ContentKey }) {
  const def = sectionById(id)!;
  const { draft, saved, setSection, dirtyIds, saveError, reload, discard, showRequired } = useDraft();
  const [preview, setPreview] = useState(false);
  const value = draft[id] as unknown as Record<string, unknown>;
  const errors = validateSection(def, value, { required: showRequired });
  const issues = Object.keys(errors).length;
  const dirty = dirtyIds.includes(id);
  const canPreview = Boolean(def.anchor) || id === "site";

  const page = (
    <Page
      title={def.title}
      subtitle={def.description}
      backHref="/admin"
      wide={preview}
      badges={
        <>
          {dirty && <Badge tone="warning" dot>Unsaved</Badge>}
          {issues > 0 && <Badge tone="critical">{issues} to fix</Badge>}
        </>
      }
      actions={
        <>
          {canPreview && (
            <Button
              icon={preview ? "close" : "eye"}
              label={preview ? "Close preview" : "Preview"}
              onClick={() => setPreview((v) => !v)}
            />
          )}
          {def.anchor && !preview && (
            <ButtonLink
              href={`${cmsConfig.siteUrl}${def.anchor === "top" ? "" : `#${def.anchor}`}`}
              external
              icon="external"
              label="View on site"
            />
          )}
        </>
      }
    >
      <div style={{ display: "grid", gap: 16 }}>
        {saveError && (
          <Banner
            tone="critical"
            title="Your changes weren’t saved"
            actions={
              /changed on GitHub/.test(saveError) ? (
                <Button
                  label="Discard my changes and reload"
                  onClick={() => {
                    discard();
                    void reload();
                  }}
                />
              ) : undefined
            }
          >
            {saveError}
          </Banner>
        )}
        <Layout
          aside={
            preview ? undefined : (
              <>
                <Card title="Status">
                  <div style={{ display: "grid", gap: 12 }}>
                    <p>
                      {dirty ? (
                        <Badge tone="warning" dot>Unsaved changes</Badge>
                      ) : (
                        <Badge tone="success">Saved</Badge>
                      )}
                    </p>
                    <PublishStatus compact />
                  </div>
                </Card>
                {hasLines(def.cards.flatMap((c) => c.fields)) && (
                  <Card title="Highlighting words">
                    <p style={{ color: "var(--a-text-secondary)" }}>
                      In titles, wrap words in asterisks to set them in the accent colour:{" "}
                      <code>*Indian roots*</code>.
                    </p>
                  </Card>
                )}
                {dirty && (
                  <Card title="Changed your mind?">
                    <p style={{ color: "var(--a-text-secondary)", marginBottom: 12 }}>
                      Put this section back the way it was when you last saved.
                    </p>
                    <Button label="Revert section" icon="refresh" onClick={() => setSection(id, structuredClone(saved[id]))} />
                  </Card>
                )}
              </>
            )
          }
        >
          {def.cards.map((card) => (
            <Card key={card.title} title={card.title} description={card.description}>
              <FieldList
                fields={card.fields}
                value={value}
                onChange={(v) => setSection(id, v)}
                errors={errors}
              />
            </Card>
          ))}
        </Layout>
      </div>
    </Page>
  );

  if (!preview) return page;
  return (
    <div className={styles.split}>
      <div className={styles.splitForm}>{page}</div>
      <PreviewPane anchor={def.anchor ?? "top"} />
    </div>
  );
}
