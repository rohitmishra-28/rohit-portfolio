import { SectionReveal } from "@/components/SectionReveal";

// 08 — Contact / Namaste invitation. Headline group, then copy + CTAs after ~80ms.
export function ContactSection() {
  return (
    <SectionReveal id="contact" distance={12} duration={420} stagger={80}>
      {null}
    </SectionReveal>
  );
}
