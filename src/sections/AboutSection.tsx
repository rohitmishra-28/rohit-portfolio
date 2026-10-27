import { SectionReveal } from "@/components/SectionReveal";

// 02 — About. Headline rises 12px; bio follows; fact items stagger ~70ms.
export function AboutSection() {
  return (
    <SectionReveal id="about" distance={12} duration={420} stagger={70}>
      {null}
    </SectionReveal>
  );
}
