import * as ImagePicker from "expo-image-picker";
import { Image as ExpoImage } from "expo-image";
import { getSuggestedCalibrationRect } from "./calibration";
import { captureAndSaveExports } from "./export-files";
import { translate } from "./i18n";
import { useQuickPanelStore } from "./store";
import type { ExportRefs } from "./types";

export function useQuickPanelActions(refs: ExportRefs) {
  const image = useQuickPanelStore((state) => state.image);
  const activePreset = useQuickPanelStore((state) => state.activePreset);
  const setScreenshot = useQuickPanelStore((state) => state.setScreenshot);
  const setImage = useQuickPanelStore((state) => state.setImage);
  const resetFit = useQuickPanelStore((state) => state.resetFit);
  const startExport = useQuickPanelStore((state) => state.startExport);
  const finishExport = useQuickPanelStore((state) => state.finishExport);
  const failExport = useQuickPanelStore((state) => state.failExport);

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

  const pickScreenshot = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ["images"],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const screenshot = {
        fileName: asset.fileName,
        height: asset.height,
        uri: asset.uri,
        width: asset.width,
      };
      setScreenshot(screenshot, getSuggestedCalibrationRect(screenshot));
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
        error instanceof Error ? error.message : translate("errors.unableToExport")
      );
    }
  };

  return { exportImages, pickImage, pickScreenshot, resetFit };
}
