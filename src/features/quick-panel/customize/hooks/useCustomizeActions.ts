import { Image as ExpoImage } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useShallow } from "zustand/react/shallow";
import { translate } from "../../model/i18n";
import type { ExportRefs } from "../../model/types";
import { quickPanelSelectors } from "../../store/selectors";
import { useQuickPanelStore } from "../../store/quick-panel-store";
import { captureAndSaveExports } from "../services/export-files";

export function useCustomizeActions(refs: ExportRefs) {
  const {
    activePreset,
    image,
    setImage,
    resetFit,
    startExport,
    finishExport,
    failExport,
  } = useQuickPanelStore(useShallow(quickPanelSelectors.customizeActions));

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ["images"],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImage({
        fileName: asset.fileName,
        height: asset.height,
        uri: asset.uri,
        width: asset.width,
      });
    }
  };

  const exportImages = async () => {
    startExport();

    try {
      if (image) {
        await ExpoImage.prefetch(image.uri);
      }
      const exports = await captureAndSaveExports(refs, activePreset);
      finishExport(exports);
    } catch (error) {
      failExport(
        error instanceof Error
          ? error.message
          : translate("errors.unableToExport"),
      );
    }
  };

  return { exportImages, pickImage, resetFit };
}
