import { Text } from "@/components/ani-ui/text";
import { Pressable, View } from "react-native";

interface CalibrationModeCardProps {
  description: string;
  onPress: () => void;
  selected: boolean;
  title: string;
}

export function CalibrationModeCard({
  description,
  onPress,
  selected,
  title,
}: CalibrationModeCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`rounded-2xl border p-4 ${
        selected
          ? "border-orange-300 bg-orange-300/10"
          : "border-zinc-800 bg-zinc-900"
      }`}
      onPress={onPress}
    >
      <View className="gap-1">
        <Text className="text-base font-semibold text-white">{title}</Text>
        <Text className="text-sm leading-5 text-zinc-400">{description}</Text>
      </View>
    </Pressable>
  );
}
