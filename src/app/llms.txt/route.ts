import { content, siteUrl } from "@/content";

// /llms.txt: a plain-text profile for AI assistants and answer engines
// (llmstxt.org), written at build time from the same CMS content as the
// homepage, so it never drifts from what the site says.
export const dynamic = "force-static";

const { site, journey, work, expertise } = content;
const abs = (path: string) => (siteUrl ? `${siteUrl}${path}` : path);
const list = (value: string) => value.split(",").map((s) => s.trim()).filter(Boolean);

export function GET() {
  const lines = [
    `# ${site.fullName}`,
    "",
    `> ${site.role} in ${site.locality}, ${site.country === "IN" ? "India" : site.country}. ${site.summary}`,
    "",
    `Also known as: ${list(site.alternateNames).join(", ")}.`,
    ...(site.employer ? [`Currently: ${journey.chapters.at(-1)?.role ?? site.role} at ${site.employer}.`] : []),
    "",
    "## Links",
    "",
    `- [Portfolio](${abs("/")}): homepage with work, career journey, expertise and contact`,
    `- [Résumé (PDF)](${abs(site.resume)})`,
    `- [LinkedIn](${site.linkedin})`,
    `- [GitHub](${site.github})`,
    `- Email: ${site.email}`,
    "",
    "## Career",
    "",
    ...journey.chapters.map((c) => `- ${c.dates}: ${c.role}, ${c.company} (${c.location}). ${c.points.map((p) => p.body).join(" ")}`),
    "",
    "## Selected work",
    "",
    ...work.projects.map((p) => `- ${p.href ? `[${p.name}](${p.href})` : p.name}: ${p.title}. ${p.stack}.`),
    "",
    "## Expertise",
    "",
    ...expertise.cards.map((c) => `- ${c.title}: ${c.skills}`),
    "",
    `Topics: ${list(site.knowsAbout).join(", ")}.`,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
