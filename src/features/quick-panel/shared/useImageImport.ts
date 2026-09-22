import { recordCrashlyticsError } from "@/lib/crashlytics";
import { useEffect, useRef } from "react";
import { deleteOwnedCacheUris } from "../cache/cache-files";
import type { PickedImage } from "../model/types";
import { useQuickPanelStore } from "../store/quick-panel-store";
import { pickImageFromLibrary } from "./pick-image-from-library";

const importErrorKeys = new Set([
  "errors.unableToProcessImage",
  "errors.unableToOpenImagePicker",
  "errors.imagePickerRestartRequired",
]);

/** The callback installs a prepared image synchronously and takes its ownership. */
export function useImageImport(onSelected: (image: PickedImage) => void) {
  const operation = useRef<object | null>(null);
  const mounted = useRef(true);
  const isImporting = useQuickPanelStore((state) => state.isProcessingImage);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (operation.current) {
        operation.current = null;
        useQuickPanelStore.setState({ isProcessingImage: false });
      }
    };
  }, []);

  const importImage = async () => {
    const state = useQuickPanelStore.getState();
    if (!mounted.current || operation.current || state.isProcessingImage || state.isExporting) return;
    const token = {};
    operation.current = token;
    state.startImageProcessing();
    try {
      const image = await pickImageFromLibrary();
      if (!image) return;
      if (operation.current !== token || !mounted.current) {
        deleteOwnedCacheUris(image.ownedCacheUris ?? [], { action: "cleanup_abandoned_import" });
        return;
      }
      onSelected(image);
    } catch (error) {
      if (operation.current !== token || !mounted.current) return;
      void recordCrashlyticsError(error instanceof Error ? error.cause ?? error : error, {
        action: "import_image", mode: state.selectedMode, presetId: state.activePreset.id,
      });
      state.failImageProcessing(null,
        error instanceof Error && importErrorKeys.has(error.message)
          ? error.message : "errors.unableToProcessImage");
    } finally {
      if (operation.current === token) {
        operation.current = null;
        useQuickPanelStore.setState({ isProcessingImage: false });
      }
    }
  };

  return { importImage, isImporting };
}
