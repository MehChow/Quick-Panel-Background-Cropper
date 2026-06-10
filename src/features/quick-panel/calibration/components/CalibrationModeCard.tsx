import { Text } from "@/components/ani-ui/text";
import { Pressable, View } from "react-native";

interface CalibrationModeCardProps {
  description: string;
  onPress: () => void;
  selected: boolean;
  status: string;
  title: string;
}

export function CalibrationModeCard({
  description,
  onPress,
  selected,
  status,
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
      <View className="flex-row items-start gap-3">
        <View className="flex-1 gap-1">
          <Text className="text-base font-semibold text-white">{title}</Text>
          <Text className="text-sm leading-5 text-zinc-400">{description}</Text>
        </View>
        <View
          className={`rounded-full px-2.5 py-1 ${
            selected ? "bg-orange-200/20" : "bg-zinc-800"
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              selected ? "text-orange-100" : "text-zinc-300"
            }`}
          >
            {status}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
