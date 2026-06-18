import { Text } from "@/components/ani-ui/text";
import * as Application from "expo-application";
import { View } from "react-native";

export default function BuildVersion() {
  return (
    <View
      className="absolute left-0 right-0 bottom-0 px-4 pb-2 items-end justify-end"
      pointerEvents="none" // 👈 VERY IMPORTANT: Allows clicks to pass through to buttons underneath
    >
      <Text style={{ color: "rgba(128, 128, 128, 0.6)", fontSize: 10 }}>
        Build: {Application.nativeApplicationVersion} (
        {Application.nativeBuildVersion})
      </Text>
    </View>
  );
}
