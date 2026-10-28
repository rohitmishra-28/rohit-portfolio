import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sectionById, sections } from "@/admin/schema";
import { SectionEditor } from "@/admin/screens/SectionEditor";

// One static page per editable section (Settings has its own route).
export const dynamicParams = false;

export function generateStaticParams() {
  return sections.filter((s) => s.id !== "site").map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: PageProps<"/admin/sections/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: `${sectionById(id)?.title ?? "Section"} · Admin` };
}

export default async function SectionPage({ params }: PageProps<"/admin/sections/[id]">) {
  const { id } = await params;
  const def = sectionById(id);
  if (!def || def.id === "site") notFound();
  return <SectionEditor id={def.id} />;
}
