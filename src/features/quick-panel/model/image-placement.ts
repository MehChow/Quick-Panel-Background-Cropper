import type { ImageTransform, PickedImage, QuickPanelPreset } from "./types";
import { getImagePlacementBounds } from "./panel-geometry";

export function getCoverScale(image: PickedImage, preset: QuickPanelPreset) {
  const imageBounds = getImagePlacementBounds(preset);
  return Math.max(
    imageBounds.width / image.width,
    imageBounds.height / image.height,
  );
}

export function getFitTransform(
  image: PickedImage,
  preset: QuickPanelPreset,
): ImageTransform {
  const area = preset.customizationArea;
  const scale = getCoverScale(image, preset);
  return clampTransform({
    scale,
    x: area.x + (area.width - image.width * scale) / 2,
    y: area.y + (area.height - image.height * scale) / 2,
  }, image, preset);
}

export function isTransformAtFit(
  transform: ImageTransform,
  image: PickedImage,
  preset: QuickPanelPreset,
) {
  const fit = getFitTransform(image, preset);
  return (
    isNearlyEqual(transform.scale, fit.scale) &&
    isNearlyEqual(transform.x, fit.x) &&
    isNearlyEqual(transform.y, fit.y)
  );
}

export function clampTransform(
  transform: ImageTransform,
  image: PickedImage,
  preset: QuickPanelPreset,
): ImageTransform {
  const imageBounds = getImagePlacementBounds(preset);
  const minScale = getCoverScale(image, preset);
  const scale = Math.max(minScale, Math.min(minScale * 8, transform.scale));
  const width = image.width * scale;
  const height = image.height * scale;

  return {
    scale,
    x: clampAxis(transform.x, width, imageBounds.x, imageBounds.width),
    y: clampAxis(transform.y, height, imageBounds.y, imageBounds.height),
  };
}

function clampAxis(
  value: number,
  contentSize: number,
  frameStart: number,
  frameSize: number,
) {
  const min = frameStart + frameSize - contentSize;
  const max = frameStart;

  if (contentSize <= frameSize) {
    return frameStart + (frameSize - contentSize) / 2;
  }

  return Math.max(min, Math.min(max, value));
}

function isNearlyEqual(a: number, b: number) {
  return Math.abs(a - b) < 0.01;
}
