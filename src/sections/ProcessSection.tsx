import { SectionReveal } from "@/components/SectionReveal";

// 06 — Process. Understand → Explore → Build → Refine, ~80ms stagger.
export function ProcessSection() {
  return (
    <SectionReveal id="process" distance={12} duration={390} stagger={80}>
      {null}
    </SectionReveal>
  );
}
