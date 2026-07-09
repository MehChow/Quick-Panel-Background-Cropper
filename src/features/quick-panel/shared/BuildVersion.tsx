import { Text } from "@/components/ani-ui/text";
import * as Application from "expo-application";
import { View } from "react-native";

export default function BuildVersion() {
  return (
    <View className="items-end">
      <Text style={{ color: "rgba(128, 128, 128, 0.6)", fontSize: 10 }}>
        Build: {Application.nativeApplicationVersion} (
        {Application.nativeBuildVersion})
      </Text>
    </View>
  );
}
