import { Text } from "@/components/ani-ui/text";
import { View } from "react-native";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
}

export function AppHeader({
  title = "Quick Panel Exporter",
  subtitle = "Put your Waifu as the background in the Quick Panel!",
}: AppHeaderProps) {
  return (
    <View className="mb-5">
      <Text variant="h2" className="text-white">
        {title}
      </Text>
      <Text className="mt-2 text-sm leading-5 text-zinc-400">
        {subtitle}
      </Text>
    </View>
  );
}
