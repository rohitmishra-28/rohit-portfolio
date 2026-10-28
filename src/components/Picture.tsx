import { asset } from "@/lib/base-path";
import type { CSSProperties } from "react";
import { images, type ImageName } from "@/lib/images.generated";
import { previewImages } from "@/lib/preview-images";

type Props = {
  /** Image manifest name (content image fields). */
  name: string;
  /** Different artwork for desktop (≥1024px); `name` is then the mobile art. */
  desktopName?: string;
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

const DESKTOP = "(min-width: 1024px)";

const isBuilt = (name: string): name is ImageName => name in images;

const srcSet = (name: ImageName, ext: "avif" | "webp") =>
  images[name].widths.map((w) => `${asset(`/images/${name}-${w}.${ext}`)} ${w}w`).join(", ");

const largest = (name: ImageName) => {
  const { widths } = images[name];
  return asset(`/images/${name}-${widths[widths.length - 1]}.webp`);
};

/** Responsive AVIF/WebP image from the pre-generated set in public/images. */
export function Picture({
  name,
  desktopName,
  alt,
  sizes,
  priority = false,
  className,
  imgClassName,
  objectPosition,
}: Props) {
  const style: CSSProperties | undefined = objectPosition ? { objectPosition } : undefined;

  // CMS preview of an image that hasn't been built yet: one plain source.
  if (!isBuilt(name) || (desktopName && !isBuilt(desktopName))) {
    const fallback = (n: string) => (isBuilt(n) ? largest(n) : (previewImages.get(n) ?? ""));
    return (
      <picture className={className}>
        {desktopName && <source media={DESKTOP} srcSet={fallback(desktopName)} />}
        <img src={fallback(name)} alt={alt} decoding="async" className={imgClassName} style={style} />
      </picture>
    );
  }

  const { width, height } = images[name];

  return (
    <picture className={className}>
      {desktopName && (
        <>
          <source media={DESKTOP} type="image/avif" srcSet={srcSet(desktopName as ImageName, "avif")} sizes={sizes} />
          <source media={DESKTOP} type="image/webp" srcSet={srcSet(desktopName as ImageName, "webp")} sizes={sizes} />
        </>
      )}
      <source type="image/avif" srcSet={srcSet(name, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(name, "webp")} sizes={sizes} />
      <img
        src={largest(name)}
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
