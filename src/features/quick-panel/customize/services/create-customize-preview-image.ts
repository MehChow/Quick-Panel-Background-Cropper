import { ImageManipulator, SaveFormat, type ImageRef } from "expo-image-manipulator";
import type { PickedImage } from "../../model/types";

const previewLongEdge = 1080;

export interface CustomizePreviewImage {
  isOwned: boolean;
  uri: string;
}

export function getCustomizePreviewResize(
  width: number,
  height: number,
): { width: number; height: number } | null {
  if (Math.max(width, height) <= previewLongEdge) {
    return null;
  }

  if (width >= height) {
    return {
      height: Math.max(1, Math.round((height / width) * previewLongEdge)),
      width: previewLongEdge,
    };
  }

  return {
    height: previewLongEdge,
    width: Math.max(1, Math.round((width / height) * previewLongEdge)),
  };
}

export async function createCustomizePreviewImage(
  image: PickedImage,
): Promise<CustomizePreviewImage> {
  const resize = getCustomizePreviewResize(image.width, image.height);
  if (!resize) {
    return { isOwned: false, uri: image.uri };
  }

  const context = ImageManipulator.manipulate(image.uri);
  let rendered: ImageRef | undefined;
  try {
    context.resize(resize);
    rendered = await context.renderAsync();
    const result = await rendered.saveAsync({ compress: 1, format: SaveFormat.PNG });
    return { isOwned: true, uri: result.uri };
  } finally {
    rendered?.release();
    context.release();
  }
}
