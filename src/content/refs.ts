import type { SiteContentMap } from "./types";

/** Every image name the content refers to, with where it's used. */
export function imageRefs(c: SiteContentMap): [string, string][] {
  return [
    [c.hero.image, "Hero"],
    [c.hero.imageDesktop, "Hero"],
    [c.about.image, "About"],
    [c.journey.figure, "Journey"],
    [c.journey.background, "Journey"],
    [c.journey.backgroundMobile, "Journey"],
    ...c.journey.chapters.filter((ch) => ch.logo).map((ch): [string, string] => [ch.logo, "Journey"]),
    [c.work.background, "Featured work"],
    ...c.work.projects.map((p): [string, string] => [p.image, "Featured work"]),
    ...c.expertise.cards.flatMap((card): [string, string][] => [
      [card.emblem, "Expertise"],
      [card.image, "Expertise"],
    ]),
    [c.philosophy.image, "Engineering philosophy"],
    ...c.process.steps.map((s): [string, string] => [s.image, "Process"]),
    [c.signature.image, "Heritage signature"],
  ];
}
