import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import type { PickedImage } from "../../model/types";

interface CustomizeImageAsset {
  uri: string;
  width: number;
  height: number;
  fileName?: string | null;
  fileSize?: number;
  mimeType?: string;
}

interface NormalizeCustomizeImageResult {
  image: PickedImage;
  noticeKey: string | null;
}

const maxUnchangedLongEdge = 3072;
const maxProcessLongEdge = 6144;
const maxProcessPixels = 20_000_000;
const resizedLongEdge = 3072;

export async function normalizeCustomizeImage(
  asset: CustomizeImageAsset,
): Promise<NormalizeCustomizeImageResult> {
  if (isTooLargeToProcess(asset)) {
    throw new Error("errors.imageTooLarge");
  }

  if (getLongEdge(asset) <= maxUnchangedLongEdge) {
    return { image: toPickedImage(asset), noticeKey: null };
  }

  const context = ImageManipulator.manipulate(asset.uri);
  const targetSize = getResizeSize(asset.width, asset.height);
  context.resize(targetSize);

  const rendered = await context.renderAsync();
  const result = await rendered.saveAsync({
    compress: 0.9,
    format: getSaveFormat(asset),
  });

  return {
    image: {
      fileName: asset.fileName,
      height: result.height,
      originalHeight: asset.height,
      originalWidth: asset.width,
      uri: result.uri,
      wasOptimized: true,
      width: result.width,
    },
    noticeKey: "customize.imageOptimized",
  };
}

function toPickedImage(asset: CustomizeImageAsset): PickedImage {
  return {
    fileName: asset.fileName,
    height: asset.height,
    uri: asset.uri,
    width: asset.width,
  };
}

function isTooLargeToProcess(asset: CustomizeImageAsset) {
  return getLongEdge(asset) > maxProcessLongEdge
    || asset.width * asset.height > maxProcessPixels;
}

function getLongEdge(asset: Pick<CustomizeImageAsset, "width" | "height">) {
  return Math.max(asset.width, asset.height);
}

function getResizeSize(width: number, height: number) {
  if (width >= height) {
    return {
      height: Math.round((height / width) * resizedLongEdge),
      width: resizedLongEdge,
    };
  }

  return {
    height: resizedLongEdge,
    width: Math.round((width / height) * resizedLongEdge),
  };
}

function getSaveFormat(asset: CustomizeImageAsset) {
  const type = `${asset.mimeType ?? ""} ${asset.fileName ?? ""}`.toLowerCase();
  return type.includes("png") || type.includes("webp")
    ? SaveFormat.PNG
    : SaveFormat.JPEG;
}
