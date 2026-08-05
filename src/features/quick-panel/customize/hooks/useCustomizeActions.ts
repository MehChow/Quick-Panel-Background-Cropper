import { useShallow } from "zustand/react/shallow";
import { pickImageFromLibrary } from "../../shared/pick-image-from-library";
import { quickPanelSelectors } from "../../store/selectors";
import { useQuickPanelStore } from "../../store/quick-panel-store";
import { recordCrashlyticsError } from "@/lib/crashlytics";
import { normalizeCustomizeImage } from "../services/normalize-customize-image";
import { useOwnedImageCache } from "../../cache/useOwnedImageCache";

export function useCustomizeActions() {
  const ownedImageCache = useOwnedImageCache();
  const {
    activePreset,
    image,
    isProcessingImage,
    startImageProcessing,
    finishImageProcessing,
    failImageProcessing,
    resetFit,
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
      ownedImageCache.track(pickedImage);

      try {
        const normalized = await normalizeCustomizeImage(pickedImage);
        ownedImageCache.track(normalized.image);
        finishImageProcessing(normalized.image);
        ownedImageCache.release(image);
      } catch (error) {
        ownedImageCache.release(pickedImage);
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

  return { pickImage, resetFit };
}
