import type { SiteContentMap } from "@/content/types";
import { AboutSection } from "./AboutSection";
import { ContactSection } from "./ContactSection";
import { EngineeringPhilosophySection } from "./EngineeringPhilosophySection";
import { ExpertiseSection } from "./ExpertiseSection";
import { FeaturedWorkSection } from "./FeaturedWorkSection";
import { HeritageSignatureSection } from "./HeritageSignatureSection";
import { HeroSection } from "./HeroSection";
import { JourneySection } from "./JourneySection";
import { ProcessSection } from "./ProcessSection";

/** The homepage sections in order. Shared by the site and the CMS preview. */
export function HomeSections({ content: c }: { content: SiteContentMap }) {
  return (
    <>
      <HeroSection content={c.hero} site={c.site} />
      <AboutSection content={c.about} site={c.site} />
      <JourneySection content={c.journey} />
      <FeaturedWorkSection content={c.work} site={c.site} />
      <ExpertiseSection content={c.expertise} />
      <EngineeringPhilosophySection content={c.philosophy} />
      <ProcessSection content={c.process} />
      <HeritageSignatureSection content={c.signature} />
      <ContactSection content={c.contact} site={c.site} />
    </>
  );
}
