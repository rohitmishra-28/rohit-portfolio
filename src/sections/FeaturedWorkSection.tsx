import { SectionReveal } from "@/components/SectionReveal";

// 03 — Featured Work. Cards rise 18px with ~90ms stagger.
export function FeaturedWorkSection() {
  return (
    <SectionReveal id="work" distance={18} duration={420} stagger={90}>
      {null}
    </SectionReveal>
  );
}
