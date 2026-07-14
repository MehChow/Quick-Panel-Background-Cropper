import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import { useShallow } from "zustand/react/shallow";
import { translate } from "../../model/i18n";
import type { ExportRefs } from "../../model/types";
import { pickImageFromLibrary } from "../../shared/pick-image-from-library";
import { quickPanelSelectors } from "../../store/selectors";
import { useQuickPanelStore } from "../../store/quick-panel-store";
import { recordCrashlyticsError } from "@/lib/crashlytics";
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

    try {
      const pickedImage = await pickImageFromLibrary();
      if (!pickedImage) {
        return;
      }

      startImageProcessing();

      try {
        const normalized = await normalizeCustomizeImage(pickedImage);
        finishImageProcessing(normalized.image, normalized.noticeKey);
      } catch (error) {
        void recordCrashlyticsError(error, {
          action: "normalize_customize_image",
          mode: useQuickPanelStore.getState().selectedMode,
          presetId: activePreset.id,
        });
        failImageProcessing(
          null,
          error instanceof Error
            ? error.message
            : "errors.unableToProcessImage",
        );
      }
    } catch (error) {
      void recordCrashlyticsError(error, {
        action: "pick_customize_image",
        mode: useQuickPanelStore.getState().selectedMode,
        presetId: activePreset.id,
      });
      failImageProcessing(
        null,
        error instanceof Error
          ? error.message
          : "errors.unableToOpenImagePicker",
      );
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
      void recordCrashlyticsError(error, {
        action: "export_images",
        mode: useQuickPanelStore.getState().selectedMode,
        presetId: activePreset.id,
      });
      failExport(
        error instanceof Error
          ? error.message
          : translate("errors.unableToExport"),
      );
    }
  };

  return { beginExport, exportImages, pickImage, resetFit };
}
