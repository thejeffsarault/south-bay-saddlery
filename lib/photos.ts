import type { PhotoAngleId } from "./catalog";

export async function fileToThumb(file: File): Promise<{
  name: string;
  thumb: string;
}> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) {
    return { name: file.name, thumb: URL.createObjectURL(file) };
  }

  const max = 360;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { name: file.name, thumb: URL.createObjectURL(file) };
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return { name: file.name, thumb: canvas.toDataURL("image/jpeg", 0.72) };
}

export function angleComplete(
  photos: Partial<Record<PhotoAngleId, { name: string; thumb: string }>>,
  id: PhotoAngleId,
) {
  return Boolean(photos[id]?.thumb);
}
