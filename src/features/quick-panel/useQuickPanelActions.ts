import * as ImagePicker from "expo-image-picker";
import { Image as ExpoImage } from "expo-image";
import { captureAndSaveExports } from "./export-files";
import { useQuickPanelStore } from "./store";
import type { ExportRefs } from "./types";

export function useQuickPanelActions(refs: ExportRefs) {
  const image = useQuickPanelStore((state) => state.image);
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

  const exportImages = async () => {
    startExport();

    try {
      if (image) {
        await ExpoImage.prefetch(image.uri);
      }
      const exports = await captureAndSaveExports(refs);
      finishExport(exports);
    } catch (error) {
      failExport(
        error instanceof Error ? error.message : "Unable to export images."
      );
    }
  };

  return { exportImages, pickImage, resetFit };
}
