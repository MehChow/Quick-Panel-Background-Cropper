import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";
import type { PickedImage } from "../model/types";

export async function pickImageFromLibrary(): Promise<PickedImage | null> {
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
    return {
      fileName: asset.fileName,
      height: asset.height,
      uri: asset.uri,
      width: asset.width,
    };
  } catch (error) {
    throw new Error(getImagePickerErrorKey(error));
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
