import { Text } from "@/components/ani-ui/text";
import { View } from "react-native";

export function AppHeader() {
  return (
    <View className="mb-5">
      <Text variant="h2" className="text-white">
        Quick Panel Exporter
      </Text>
      <Text className="mt-2 text-sm leading-5 text-zinc-400">
        Put your Waifu as the background in the Quick Panel!
      </Text>
    </View>
  );
}
