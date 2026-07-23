import type { ImageTransform } from "../../model/types";

interface PinchTransformWorkletInput {
  focalX: number;
  focalY: number;
  gestureScale: number;
  imageHeight: number;
  imageWidth: number;
  minScale: number;
  startFocalX: number;
  startFocalY: number;
  startTransform: ImageTransform;
  unionHeight: number;
  unionWidth: number;
  unionX: number;
  unionY: number;
}

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

export function getPinchTransformWorklet({
  focalX,
  focalY,
  gestureScale,
  imageHeight,
  imageWidth,
  minScale,
  startFocalX,
  startFocalY,
  startTransform,
  unionHeight,
  unionWidth,
  unionX,
  unionY,
}: PinchTransformWorkletInput): ImageTransform {
  "worklet";
  const scale = Math.max(
    minScale,
    Math.min(minScale * 8, startTransform.scale * gestureScale),
  );
  const scaleRatio = scale / startTransform.scale;

  return clampTransformWorklet(
    focalX - (startFocalX - startTransform.x) * scaleRatio,
    focalY - (startFocalY - startTransform.y) * scaleRatio,
    scale,
    imageWidth,
    imageHeight,
    minScale,
    unionX,
    unionY,
    unionWidth,
    unionHeight,
  );
}
