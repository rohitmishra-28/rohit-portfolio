import { SectionReveal } from "@/components/SectionReveal";

// 04 — Expertise. Four capability cards, 12px rise, ~90ms stagger.
export function ExpertiseSection() {
  return (
    <SectionReveal id="expertise" distance={12} duration={420} stagger={90}>
      {null}
    </SectionReveal>
  );
}
