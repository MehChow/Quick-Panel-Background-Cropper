import { Text } from "@/components/ani-ui/text";
import { Lucide } from "@react-native-vector-icons/lucide";
import { Pressable } from "react-native";

interface GridHelpButtonProps {
  label: string;
  onPress: () => void;
  testID?: string;
}

export function GridHelpButton({ label, onPress, testID }: GridHelpButtonProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      className="h-8 flex-row items-center gap-1 rounded-full border border-[#f3c992]/25 bg-[#2c2328] px-2.5"
      hitSlop={8}
      onPress={onPress}
      testID={testID}
    >
      <Lucide color="#f5d6aa" name="message-circle-question" size={14} />
      <Text className="text-xs font-semibold text-[#f5d6aa]">{label}</Text>
    </Pressable>
  );
}
