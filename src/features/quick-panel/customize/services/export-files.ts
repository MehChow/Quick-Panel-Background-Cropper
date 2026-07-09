import { File, Paths } from "expo-file-system";
import { Album, Asset, requestPermissionsAsync } from "expo-media-library";
import { Platform } from "react-native";
import { captureRef, releaseCapture } from "react-native-view-shot";
import { recordCrashlyticsError } from "@/lib/crashlytics";
import { getPanelLabel, translate } from "../../model/i18n";
import { exportSidePixels } from "../../model/panel-geometry";
import type {
  ExportRefs,
  GeneratedExport,
  QuickPanelPreset,
} from "../../model/types";

export async function captureAndSaveExports(
  refs: ExportRefs,
  preset: QuickPanelPreset,
): Promise<GeneratedExport[]> {
  const capturedFiles = await captureNamedFiles(refs, preset);
  await saveCapturedFiles(capturedFiles);

  return capturedFiles.map((file) => ({
    fileName: file.fileName,
    id: file.id,
    label: file.label,
    previewUri: file.previewUri,
    uri: file.uri,
  }));
}

async function captureNamedFiles(refs: ExportRefs, preset: QuickPanelPreset) {
  const files: GeneratedExport[] = [];

  for (const id of preset.goodLockOrder) {
    const panel = preset.panels[id];
    const ref = refs[id].current;

    if (!ref) {
      throw new Error(
        translate("errors.exportSurfaceMissing", {
          panel: getPanelLabel(panel.id),
        }),
      );
    }

    let tmpUri: string;

    try {
      tmpUri = await captureRef(ref, {
        fileName: panel.fileName.replace(".png", ""),
        format: "png",
        height: exportSidePixels,
        quality: 1,
        result: "tmpfile",
        width: exportSidePixels,
      });
    } catch (error) {
      void recordCrashlyticsError(error, {
        action: "capture_export_panel",
        panelId: id,
        presetId: preset.id,
      });
      throw error;
    }

    try {
      const source = new File(tmpUri);
      const target = new File(Paths.cache, panel.fileName);
      await source.copy(target, { overwrite: true });
      files.push({
        fileName: panel.fileName,
        id,
        label: getPanelLabel(panel.id),
        previewUri: target.uri,
        uri: target.uri,
      });
    } finally {
      releaseCapture(tmpUri);
    }
  }

  return files;
}

async function saveCapturedFiles(files: GeneratedExport[]) {
  const permission = await requestPermissionsAsync(true);

  if (permission.status !== "granted") {
    throw new Error(translate("errors.mediaLibraryPermission"));
  }

  if (Platform.OS !== "android") {
    for (const file of files) {
      await Asset.create(file.uri);
    }

    return;
  }

  const albumName = translate("export.albumName");
  const existingAlbum = await Album.get(albumName);

  if (existingAlbum) {
    for (const file of files) {
      await Asset.create(file.uri, existingAlbum);
    }

    return;
  }

  const [firstFile, ...remainingFiles] = files;
  const album = await Album.create(albumName, [firstFile.uri]);

  for (const file of remainingFiles) {
    await Asset.create(file.uri, album);
  }
}
