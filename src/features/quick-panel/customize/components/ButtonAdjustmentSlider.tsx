import { Slider } from "@/components/ani-ui/slider";
import { Text } from "@/components/ani-ui/text";
import { View } from "react-native";

export interface ButtonAdjustment {
  accessibilityLabel: string;
  disabled: boolean;
  label: string;
  onValueChange: (value: number) => void;
  sliderTestID: string;
  tabLabel: string;
  tabTestID: string;
  value: number;
  valueKey: string;
}

interface ButtonAdjustmentSliderProps {
  adjustment: ButtonAdjustment;
}

export function ButtonAdjustmentSlider({
  adjustment,
}: ButtonAdjustmentSliderProps) {
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-semibold uppercase tracking-[0.8px] text-zinc-300">
          {adjustment.label}
        </Text>
        <Text className="text-sm font-semibold tabular-nums text-white">
          {adjustment.value}%
        </Text>
      </View>
      <View className="rounded-lg bg-zinc-800/95 px-3 py-2">
        <Slider
          disabled={adjustment.disabled}
          max={100}
          min={0}
          onValueChange={adjustment.onValueChange}
          size="sm"
          step={1}
          trackClassName="bg-slate-400"
          testID={adjustment.sliderTestID}
          value={adjustment.value}
        />
      </View>
    </View>
  );
}
