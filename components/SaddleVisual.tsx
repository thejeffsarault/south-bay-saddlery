import { PHOTO_ANGLES, type PhotoAngleId } from "@/lib/catalog";

export function LeatherPlate({
  caption,
  className = "",
}: {
  caption: string;
  className?: string;
}) {
  return (
    <div
      className={`leather-plate relative overflow-hidden ${className}`}
      aria-hidden
    >
      <div className="pointer-events-none absolute inset-3 border border-brass/35" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-3 py-2">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-brass">
          {caption}
        </p>
      </div>
    </div>
  );
}

function angleCaption(id: PhotoAngleId, hasPhoto: boolean) {
  if (id === "damage" && hasPhoto) return "Cover";
  return (
    PHOTO_ANGLES.find((angle) => angle.id === id)?.label ??
    id.replaceAll("-", " ")
  );
}

export function AngleGrid({
  labels,
  photoSrcs,
  altPrefix,
}: {
  labels: PhotoAngleId[];
  photoSrcs?: Partial<Record<PhotoAngleId, string>>;
  altPrefix?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {labels.map((label) => {
        const src = photoSrcs?.[label];
        const caption = angleCaption(label, Boolean(src));
        if (src) {
          const alt = altPrefix ? `${altPrefix}, ${caption}` : caption;
          return (
            <figure
              key={label}
              className="relative aspect-[4/5] overflow-hidden border border-border bg-ivory-soft"
            >
              <img
                src={src}
                alt={alt}
                className="h-full w-full object-contain"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-3 py-2">
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-brass">
                  {caption}
                </p>
              </figcaption>
            </figure>
          );
        }

        return (
          <LeatherPlate
            key={label}
            caption={caption}
            className="aspect-[4/5]"
          />
        );
      })}
    </div>
  );
}
