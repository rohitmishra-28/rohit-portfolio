/**
 * Sets up section timelines off the critical path. Building every
 * ScrollTrigger at once was one long task on phones (~0.7s at 4× CPU), so
 * below-the-fold sections queue here and are built after the load event, one
 * per idle task, in page order: pins measure themselves as they're created,
 * so each one sees the spacers of the pins above it. Sections stay fully
 * visible until their turn.
 */
type Job = () => void;

const queue: Job[] = [];
let scheduled = false;
let markReady: () => void = () => {};

const ready = new Promise<void>((resolve) => (markReady = resolve));

/** Resolves once every queued section has been set up (at once if none are). */
export const sectionsReady = () => (scheduled ? ready : Promise.resolve());

const idle = (fn: () => void) =>
  "requestIdleCallback" in window
    ? requestIdleCallback(fn, { timeout: 500 })
    : setTimeout(fn, 1);

function next() {
  const job = queue.shift();
  if (!job) {
    scheduled = false;
    markReady();
    return;
  }
  job();
  idle(next);
}

function start() {
  if (scheduled) return;
  scheduled = true;
  const go = () => idle(next);
  if (document.readyState === "complete") go();
  else window.addEventListener("load", go, { once: true });
}

/** Queues `job`; returns a cancel function for unmounts before it runs. */
export function scheduleSetup(job: Job) {
  queue.push(job);
  start();
  return () => {
    const i = queue.indexOf(job);
    if (i >= 0) queue.splice(i, 1);
  };
}
