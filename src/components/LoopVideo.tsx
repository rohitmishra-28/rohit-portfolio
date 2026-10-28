"use client";

import { useEffect, useRef } from "react";

type Props = {
  src: string;
  /** Still frame shown before playback, and instead of it with reduced motion. */
  poster: string;
  /** Describes the footage; the video is muted, so this is its whole content. */
  label: string;
  width: number;
  height: number;
  className?: string;
};

/**
 * A muted, looping background video. It loads nothing until it nears the
 * viewport, plays only while visible, and stays on its poster frame for
 * visitors who prefer reduced motion.
 */
export function LoopVideo({ src, poster, label, width, height, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      width={width}
      height={height}
      muted
      loop
      playsInline
      preload="none"
      role="img"
      aria-label={label}
    />
  );
}
