import { AboutSection } from "@/sections/AboutSection";
import { AllProjectsSection } from "@/sections/AllProjectsSection";
import { ContactSection } from "@/sections/ContactSection";
import { EngineeringPhilosophySection } from "@/sections/EngineeringPhilosophySection";
import { ExpertiseSection } from "@/sections/ExpertiseSection";
import { FeaturedWorkSection } from "@/sections/FeaturedWorkSection";
import { HeritageSignatureSection } from "@/sections/HeritageSignatureSection";
import { HeroSection } from "@/sections/HeroSection";
import { ProcessSection } from "@/sections/ProcessSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <FeaturedWorkSection />
      <AllProjectsSection />
      <ExpertiseSection />
      <EngineeringPhilosophySection />
      <ProcessSection />
      <HeritageSignatureSection />
      <ContactSection />
    </>
  );
}
