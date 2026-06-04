import { File, Paths } from "expo-file-system";
import { Album, Asset, requestPermissionsAsync } from "expo-media-library";
import { captureRef, releaseCapture } from "react-native-view-shot";
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
  const albumName = translate("export.albumName");
  const capturedFiles = await captureNamedFiles(refs, preset);
  const permission = await requestPermissionsAsync(true);

  if (!permission.granted) {
    throw new Error(translate("errors.mediaLibraryPermission"));
  }

  let album = await Album.get(albumName);

  if (!album) {
    album = await Album.create(
      albumName,
      capturedFiles.map((file) => file.uri),
      false,
    );
  } else {
    for (const file of capturedFiles) {
      await Asset.create(file.uri, album);
    }
  }

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

    const tmpUri = await captureRef(ref, {
      fileName: panel.fileName.replace(".png", ""),
      format: "png",
      height: exportSidePixels,
      quality: 1,
      result: "tmpfile",
      width: exportSidePixels,
    });

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
