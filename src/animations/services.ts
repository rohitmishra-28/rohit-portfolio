import { byAnim, gsap, onEnter } from "./gsap";

const motion = "(prefers-reduced-motion: no-preference)";
const media = {
  // The stage (heading, service and progress rail) must fit the window.
  pinned: `(min-width: 1024px) and (min-height: 700px) and ${motion}`,
  list: `(max-width: 1023px) and ${motion}, (min-width: 1024px) and (max-height: 699px) and ${motion}`,
};

/**
 * 03 — Services (Figma 11:125, scroll states 246:80).
 * Desktop: the heading unmasks, then the stage pins and scrolling steps
 * through the services. Each step lifts the current service's details and
 * picture away and brings the next up in their place, while the side
 * navigation, the counter and the progress rail follow; the scroll snaps to
 * whole services. Clicking a service in the navigation scrolls to its step.
 * Phones and short windows: no pin, each service rises as it enters.
 * Reduced motion: nothing moves; the services stay a list.
 */
export function servicesAnimation(scope: HTMLElement, mm: gsap.MatchMedia) {
  const $ = byAnim(scope);

  mm.add(media, (ctx) => {
    const { pinned } = ctx.conditions as Record<keyof typeof media, boolean>;
    const panels = $("panel");

    onEnter(scope, "top 75%")
      .from($("marker"), { autoAlpha: 0, y: 12, duration: 0.5 })
      .from(scope.querySelectorAll('[data-anim="mask"] > span'), { yPercent: 110, duration: 0.9, stagger: 0.12 }, 0.1)
      .from($("lede"), { autoAlpha: 0, y: 16, duration: 0.7 }, 0.4)
      .from($("nav-link"), { autoAlpha: 0, x: -16, duration: 0.6, stagger: 0.08 }, 0.5);

    onEnter($("cta")[0], "top 88%").from($("cta"), { autoAlpha: 0, y: 40, duration: 0.8 });

    if (!pinned || panels.length < 2) {
      panels.forEach((panel) => {
        onEnter(panel, "top 85%").from(panel, { autoAlpha: 0, y: 50, duration: 0.8 });
      });
      return;
    }

    // Switches the CSS to the overlapping layout (ServicesSection.module.css).
    scope.dataset.pinned = "";
    const stage = $("stage")[0];
    const links = $("nav-link");
    const stepsEls = $("step");
    const parts = (panel: HTMLElement) =>
      gsap.utils.toArray<HTMLElement>(panel.querySelectorAll('[data-anim="details"] > *, [data-anim="media"]'));
    // Opacity only (not visibility), so screen readers still get every service.
    gsap.set(panels.slice(1).flatMap(parts), { opacity: 0 });

    // The first service and the rail arrive with the heading (the panel
    // list as a whole, so the scrubbed swaps below own the panels' parts).
    onEnter(stage, "top 75%")
      .from($("panels"), { opacity: 0, y: 24, duration: 0.8 }, 0.3)
      .from($("progress"), { opacity: 0, duration: 0.6 }, 0.6);

    let current = -1;
    const setCurrent = (index: number) => {
      if (index === current) return;
      current = index;
      links.forEach((link, i) => {
        if (i === index) link.setAttribute("aria-current", "step");
        else link.removeAttribute("aria-current");
      });
      stepsEls.forEach((el, i) => {
        el.toggleAttribute("data-reached", i <= index);
        el.toggleAttribute("data-current", i === index);
      });
    };
    setCurrent(0);

    const steps = panels.length - 1;
    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut", duration: 0.4 },
      scrollTrigger: {
        trigger: stage,
        start: () => (stage.offsetHeight > window.innerHeight ? "bottom bottom" : "top top"),
        end: () => `+=${Math.round(window.innerHeight * 0.7 * steps)}`,
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        // Nearest service, not projected from scroll speed, so a flick
        // can't skip one.
        snap: { snapTo: 1 / steps, inertia: false, duration: { min: 0.2, max: 0.6 }, delay: 0.05, ease: "power1.inOut" },
        onUpdate: (self) => setCurrent(Math.round(self.progress * steps)),
      },
    });

    // Service k is fully shown at time k; the swap to k + 1 runs between.
    tl.fromTo($("fill"), { scaleX: 0 }, { scaleX: 1, ease: "none", duration: steps }, 0);
    panels.slice(1).forEach((next, k) => {
      tl.to(parts(panels[k]), { opacity: 0, y: -24, stagger: 0.03 }, k + 0.2).fromTo(
        parts(next),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, stagger: 0.03, ease: "power2.out" },
        k + 0.35,
      );
    });

    // Navigation clicks scroll to that service's step instead of jumping.
    const onClick = (event: MouseEvent) => {
      const i = links.indexOf(event.currentTarget as HTMLElement);
      const st = tl.scrollTrigger;
      if (i < 0 || !st) return;
      event.preventDefault();
      window.scrollTo({ top: st.start + ((st.end - st.start) * i) / steps, behavior: "smooth" });
    };
    links.forEach((link) => link.addEventListener("click", onClick));

    return () => {
      links.forEach((link) => {
        link.removeEventListener("click", onClick);
        link.removeAttribute("aria-current");
      });
      stepsEls.forEach((el) => {
        el.removeAttribute("data-reached");
        el.removeAttribute("data-current");
      });
      delete scope.dataset.pinned;
    };
  });
}
