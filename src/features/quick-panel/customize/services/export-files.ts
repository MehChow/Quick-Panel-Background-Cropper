import { recordCrashlyticsError } from "@/lib/crashlytics";
import { File, Paths } from "expo-file-system";
import { Album, Asset, requestPermissionsAsync } from "expo-media-library";
import { Platform, type View } from "react-native";
import { captureRef, releaseCapture } from "react-native-view-shot";
import { translate } from "../../model/i18n";
import { exportSidePixels } from "../../model/panel-geometry";
import type { GeneratedExport, PanelDefinition } from "../../model/types";

export async function capturePanelExport(
  ref: View,
  panel: PanelDefinition,
): Promise<GeneratedExport> {
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
      panelId: panel.id,
    });
    throw error;
  }

  try {
    const source = new File(tmpUri);
    const target = new File(Paths.cache, panel.fileName);
    await source.copy(target, { overwrite: true });
    return {
      fileName: panel.fileName,
      id: panel.id,
      label: panel.label,
      previewUri: target.uri,
      uri: target.uri,
    };
  } finally {
    releaseCapture(tmpUri);
  }
}

export async function saveCapturedExports(
  files: GeneratedExport[],
): Promise<void> {
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
  if (!firstFile) {
    return;
  }

  const album = await Album.create(albumName, [firstFile.uri]);
  for (const file of remainingFiles) {
    await Asset.create(file.uri, album);
  }
}

export async function cleanupCapturedExports(
  files: GeneratedExport[],
): Promise<void> {
  for (const file of files) {
    try {
      new File(file.uri).delete();
    } catch (error) {
      await recordCrashlyticsError(error, {
        action: "cleanup_export_file",
        panelId: file.id,
      });
    }
  }
}
