import type { ImageTransform, PickedImage, QuickPanelPreset } from "./types";
import { getImageBounds, getPanelUnion } from "./panel-geometry";

export function getCoverScale(image: PickedImage, preset: QuickPanelPreset) {
  const imageBounds = getImageBounds(preset);
  return Math.max(
    imageBounds.width / image.width,
    imageBounds.height / image.height,
  );
}

export function getFitTransform(
  image: PickedImage,
  preset: QuickPanelPreset,
): ImageTransform {
  const panelUnion = getPanelUnion(preset);
  const scale = getCoverScale(image, preset);
  return clampTransform(
    {
      scale,
      x: panelUnion.x + (panelUnion.width - image.width * scale) / 2,
      y: panelUnion.y + (panelUnion.height - image.height * scale) / 2,
    },
    image,
    preset,
  );
}

export function clampTransform(
  transform: ImageTransform,
  image: PickedImage,
  preset: QuickPanelPreset,
): ImageTransform {
  const imageBounds = getImageBounds(preset);
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
