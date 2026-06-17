import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export function triggerSnapHaptic() {
  const haptic = Platform.OS === "android"
    ? Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Segment_Tick)
    : Haptics.selectionAsync();

  void haptic.catch(() => undefined);
}
