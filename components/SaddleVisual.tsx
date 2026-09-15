import { shotLabel } from "@/lib/catalog";
import { ListingPhoto } from "./ListingPhoto";

export { LeatherPlate } from "./LeatherPlate";

export function AngleGrid({
  labels,
  photoSrcs,
  altPrefix,
}: {
  labels: string[];
  photoSrcs?: Record<string, string>;
  altPrefix?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {labels.map((label) => {
        const src = photoSrcs?.[label];
        const caption = shotLabel(label);
        const alt = altPrefix ? `${altPrefix}, ${caption}` : caption;
        return (
          <ListingPhoto
            key={label}
            src={src}
            alt={alt}
            caption={caption}
            className="aspect-[4/5]"
          />
        );
      })}
    </div>
  );
}
