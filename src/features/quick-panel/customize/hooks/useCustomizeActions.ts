import { Image as ExpoImage } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useShallow } from "zustand/react/shallow";
import { translate } from "../../model/i18n";
import type { ExportRefs } from "../../model/types";
import { quickPanelSelectors } from "../../store/selectors";
import { useQuickPanelStore } from "../../store/quick-panel-store";
import { captureAndSaveExports } from "../services/export-files";
import { normalizeCustomizeImage } from "../services/normalize-customize-image";

export function useCustomizeActions(refs: ExportRefs) {
  const router = useRouter();
  const {
    activePreset,
    image,
    isProcessingImage,
    startImageProcessing,
    finishImageProcessing,
    failImageProcessing,
    resetFit,
    startExport,
    finishExport,
    failExport,
  } = useQuickPanelStore(useShallow(quickPanelSelectors.customizeActions));

  const pickImage = async () => {
    if (isProcessingImage) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ["images"],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      startImageProcessing();

      try {
        const normalized = await normalizeCustomizeImage(result.assets[0]);
        finishImageProcessing(normalized.image, normalized.noticeKey);
      } catch (error) {
        failImageProcessing(
          null,
          error instanceof Error
            ? error.message
            : "errors.unableToProcessImage",
        );
      }
    }
  };

  const beginExport = () => {
    if (!image || isProcessingImage) {
      return;
    }

    startExport();
  };

  const exportImages = async () => {
    try {
      if (image) {
        await ExpoImage.prefetch(image.uri);
      }
      const exports = await captureAndSaveExports(refs, activePreset);
      finishExport(exports);
      router.replace("/result");
    } catch (error) {
      failExport(
        error instanceof Error
          ? error.message
          : translate("errors.unableToExport"),
      );
    }
  };

  return { beginExport, exportImages, pickImage, resetFit };
}
