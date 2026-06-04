import type { ImageTransform } from "../../model/types";

export function clampTransformWorklet(
  x: number,
  y: number,
  scale: number,
  imageWidth: number,
  imageHeight: number,
  minScale: number,
  unionX: number,
  unionY: number,
  unionWidth: number,
  unionHeight: number,
): ImageTransform {
  "worklet";
  const safeScale = Math.max(minScale, scale);
  const width = imageWidth * safeScale;
  const height = imageHeight * safeScale;

  return {
    scale: safeScale,
    x: Math.max(unionX + unionWidth - width, Math.min(unionX, x)),
    y: Math.max(unionY + unionHeight - height, Math.min(unionY, y)),
  };
}
