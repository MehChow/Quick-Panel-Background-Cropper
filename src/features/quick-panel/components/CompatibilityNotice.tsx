import { Text } from "@/components/ani-ui/text";
import { View } from "react-native";

export function CompatibilityNotice() {
  return (
    <View className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-4">
      <Text className="text-sm leading-5 text-amber-100">
        Tested for Galaxy S25+ with One UI 8.5 only.
      </Text>
    </View>
  );
}
