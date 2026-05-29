import { Asset, Album, requestPermissionsAsync } from "expo-media-library";
import { File, Paths } from "expo-file-system";
import { captureRef } from "react-native-view-shot";
import { s25PlusOneUi85Preset } from "./preset";
import { exportSidePixels } from "./transform";
import type { ExportRefs, GeneratedExport } from "./types";

const albumName = "Quick Panel Exports";

export async function captureAndSaveExports(
  refs: ExportRefs
): Promise<GeneratedExport[]> {
  const capturedFiles = await captureNamedFiles(refs);
  const permission = await requestPermissionsAsync(true);

  if (!permission.granted) {
    throw new Error("Media library permission is required to save exports.");
  }

  let album = await Album.get(albumName);

  if (!album) {
    album = await Album.create(
      albumName,
      capturedFiles.map((file) => file.uri),
      false
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
    uri: file.uri,
  }));
}

async function captureNamedFiles(refs: ExportRefs) {
  const files: GeneratedExport[] = [];

  for (const id of s25PlusOneUi85Preset.goodLockOrder) {
    const panel = s25PlusOneUi85Preset.panels[id];
    const ref = refs[id].current;

    if (!ref) {
      throw new Error(`Export surface is missing for ${panel.label}.`);
    }

    const uri = await captureRef(ref, {
      fileName: panel.fileName.replace(".png", ""),
      format: "png",
      height: exportSidePixels,
      quality: 1,
      result: "tmpfile",
      width: exportSidePixels,
    });
    const source = new File(uri);
    const target = new File(Paths.cache, panel.fileName);
    await source.copy(target, { overwrite: true });
    files.push({ fileName: panel.fileName, id, label: panel.label, uri: target.uri });
  }

  return files;
}
