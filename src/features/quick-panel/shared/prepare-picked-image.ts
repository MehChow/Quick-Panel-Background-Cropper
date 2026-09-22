import { Image } from "expo-image";
import { ImageManipulator, SaveFormat, type ImageManipulatorContext, type ImageRef } from "expo-image-manipulator";
import type { PickedImage } from "../model/types";

const workingLongEdge = 3072;

/** Bound native decoding before encoding the single authoritative working image. */
export async function preparePickedImage(asset: PickedImage): Promise<PickedImage> {
  if (asset.width > 0 && asset.height > 0 &&
      Math.max(asset.width, asset.height) <= workingLongEdge) {
    return asset;
  }

  // Glide can round the narrow side to zero. Decode these small-pixel-count
  // strips without sampling, then clamp the final resize to at least one pixel.
  // This fallback never allocates more pixels than a square working image.
  const longEdge = Math.max(asset.width, asset.height);
  const isSmallStrip = Math.min(asset.width, asset.height) > 0 &&
    Math.min(asset.width, asset.height) * workingLongEdge / longEdge < 1 &&
    asset.width * asset.height <= workingLongEdge ** 2;
  const source = await Image.loadAsync(asset.uri, isSmallStrip
    ? { maxWidth: asset.width, maxHeight: asset.height }
    : { maxWidth: workingLongEdge, maxHeight: workingLongEdge });
  let context: ImageManipulatorContext | undefined;
  let rendered: ImageRef | undefined;
  try {
    // Pass the already downsampled, oriented native image, not its original URI.
    context = ImageManipulator.manipulate(source);
    const width = source.width * (source.scale ?? 1);
    const height = source.height * (source.scale ?? 1);
    const scale = Math.min(1, workingLongEdge / Math.max(width, height));
    if (scale < 1) {
      context.resize({
        width: Math.max(1, Math.round(width * scale)),
        height: Math.max(1, Math.round(height * scale)),
      });
    }
    rendered = await context.renderAsync();
    const type = `${asset.mimeType ?? ""} ${asset.fileName ?? ""} ${asset.uri}`.toLowerCase();
    const preserveAlpha = /png|webp/.test(type);
    const result = await rendered.saveAsync({
      compress: preserveAlpha ? 1 : 0.9,
      format: preserveAlpha ? SaveFormat.PNG : SaveFormat.JPEG,
    });
    return {
      ...asset,
      ...result,
      mimeType: preserveAlpha ? "image/png" : "image/jpeg",
      fileSize: undefined,
      originalWidth: asset.width,
      originalHeight: asset.height,
      ownedCacheUris: [result.uri],
      wasOptimized: true,
    };
  } finally {
    rendered?.release();
    context?.release();
    source.release();
  }
}
