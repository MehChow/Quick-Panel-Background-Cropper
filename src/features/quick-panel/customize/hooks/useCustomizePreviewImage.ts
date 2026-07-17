import { recordCrashlyticsError } from "@/lib/crashlytics";
import { File } from "expo-file-system";
import { useEffect, useState } from "react";
import type { PickedImage } from "../../model/types";
import {
  createCustomizePreviewImage,
  getCustomizePreviewResize,
  type CustomizePreviewImage,
} from "../services/create-customize-preview-image";

export interface CustomizePreviewImageState {
  previewUri: string;
  isPreparingPreview: boolean;
}

interface PreparedPreviewState extends CustomizePreviewImageState {
  sourceKey: string;
}

export function useCustomizePreviewImage(
  image: PickedImage | null,
): CustomizePreviewImageState {
  const [prepared, setPrepared] = useState<PreparedPreviewState | null>(null);

  useEffect(() => {
    let isCancelled = false;
    let installedPreview: CustomizePreviewImage | null = null;
    if (!image) {
      return;
    }
    const sourceKey = getSourceKey(image);

    void createCustomizePreviewImage(image)
      .then((preview) => {
        if (isCancelled) {
          deleteOwnedPreview(preview);
          return;
        }
        installedPreview = preview;
        setPrepared({
          isPreparingPreview: false,
          previewUri: preview.uri,
          sourceKey,
        });
      })
      .catch((error) => {
        if (isCancelled) {
          return;
        }
        void recordCrashlyticsError(error, {
          action: "create_customize_preview_image",
        });
        setPrepared({
          isPreparingPreview: false,
          previewUri: image.uri,
          sourceKey,
        });
      });

    return () => {
      isCancelled = true;
      deleteOwnedPreview(installedPreview);
    };
  }, [image]);

  if (!image) {
    return { isPreparingPreview: false, previewUri: "" };
  }
  if (prepared?.sourceKey === getSourceKey(image)) {
    return prepared;
  }
  return {
    isPreparingPreview: getCustomizePreviewResize(image.width, image.height) !== null,
    previewUri: image.uri,
  };
}

function getSourceKey(image: PickedImage) {
  return `${image.uri}:${image.width}:${image.height}`;
}

function deleteOwnedPreview(preview: CustomizePreviewImage | null) {
  if (!preview?.isOwned) {
    return;
  }

  try {
    new File(preview.uri).delete();
  } catch (error) {
    void recordCrashlyticsError(error, {
      action: "cleanup_customize_preview_image",
    });
  }
}
