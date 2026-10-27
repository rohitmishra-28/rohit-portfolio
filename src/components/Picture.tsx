import type { CSSProperties } from "react";
import { images, type ImageName } from "@/lib/images.generated";

type Props = {
  name: ImageName;
  /** Empty string for decorative artwork. */
  alt: string;
  /** Rendered width hint for the browser, e.g. "(min-width: 1024px) 50vw, 100vw". */
  sizes: string;
  /** Set for the LCP image only: loads eagerly with high priority. */
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  objectPosition?: string;
};

const srcSet = (name: ImageName, ext: "avif" | "webp") =>
  images[name].widths.map((w) => `/images/${name}-${w}.${ext} ${w}w`).join(", ");

/** Responsive AVIF/WebP image from the pre-generated set in public/images. */
export function Picture({
  name,
  alt,
  sizes,
  priority = false,
  className,
  imgClassName,
  objectPosition,
}: Props) {
  const { width, height, widths } = images[name];
  const style: CSSProperties | undefined = objectPosition ? { objectPosition } : undefined;

  return (
    <picture className={className}>
      <source type="image/avif" srcSet={srcSet(name, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(name, "webp")} sizes={sizes} />
      <img
        src={`/images/${name}-${widths[widths.length - 1]}.webp`}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className={imgClassName}
        style={style}
      />
    </picture>
  );
}
