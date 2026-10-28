import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";
import type { PickedImage } from "../model/types";
import { deleteOwnedCacheUris } from "../cache/cache-files";
import { preparePickedImage } from "./prepare-picked-image";

export async function pickImageFromLibrary(): Promise<PickedImage | null> {
  let picked: PickedImage | undefined;
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ["images"],
      quality: 1,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    const asset = result.assets[0];
    picked = {
      fileName: asset.fileName,
      mimeType: asset.mimeType,
      fileSize: asset.fileSize,
      height: asset.height,
      ownedCacheUris: [asset.uri],
      uri: asset.uri,
      width: asset.width,
    };
    const prepared = await preparePickedImage(picked);
    if (prepared.uri !== picked.uri) {
      deleteOwnedCacheUris(picked.ownedCacheUris ?? [], { action: "cleanup_import_source" });
    }
    return prepared;
  } catch (error) {
    if (picked) {
      deleteOwnedCacheUris(picked.ownedCacheUris ?? [], { action: "cleanup_failed_import" });
    }
    throw new Error(picked ? "errors.unableToProcessImage" : getImagePickerErrorKey(error), { cause: error });
  }
}

function getImagePickerErrorKey(error: unknown) {
  if (
    Platform.OS === "android" &&
    error instanceof Error &&
    error.message.includes("Attempting to launch an unregistered ActivityResultLauncher")
  ) {
    return "errors.imagePickerRestartRequired";
  }

  return "errors.unableToOpenImagePicker";
}
