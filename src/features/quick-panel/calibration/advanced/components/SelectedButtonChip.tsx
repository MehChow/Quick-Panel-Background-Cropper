import { Lucide } from "@react-native-vector-icons/lucide";
import { Pressable } from "react-native";
import { Text } from "@/components/ani-ui/text";
import { getButtonIconName } from "../../../model/button-labels";
import type { ButtonCalibrationItem } from "../../../model/types";

interface Props {
  button: ButtonCalibrationItem;
  displayLabel: string;
  removeLabel: string;
  onRemove: () => void;
}

export function SelectedButtonChip({
  button,
  displayLabel,
  removeLabel,
  onRemove,
}: Props) {
  const isCustom = Boolean(button.customIconId);

  return (
    <Pressable
      accessibilityLabel={`${removeLabel} ${displayLabel}`}
      accessibilityRole="button"
      className={`flex-row items-center gap-1.5 rounded-full border px-3 py-1.5 ${
        isCustom
          ? "border-amber-300/50 bg-amber-300/10"
          : "border-emerald-300/40 bg-emerald-300/10"
      }`}
      onPress={onRemove}
    >
      <Lucide
        accessible={false}
        color={isCustom ? "#fde68a" : "#d1fae5"}
        name={getButtonIconName(button.label, button.customIconId)}
        size={13}
      />
      <Text
        className={`text-xs font-semibold ${
          isCustom ? "text-amber-100" : "text-emerald-100"
        }`}
      >
        {displayLabel}
      </Text>
      <Lucide
        color={isCustom ? "#fef3c7" : "#d1fae5"}
        name="x"
        size={12}
      />
    </Pressable>
  );
}
