import { Slider } from "@/components/ani-ui/slider";
import { Text } from "@/components/ani-ui/text";
import {
  getSnapSensitivityFromSliderValue,
  getSnapSensitivitySliderValue,
  type SnapSensitivity,
} from "../../../model/snap-sensitivity";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface Props {
  onValueChange: (value: SnapSensitivity) => void;
  value: SnapSensitivity;
}

export function AdvancedSnapSensitivityControl({
  onValueChange,
  value,
}: Props) {
  const { t } = useTranslation();
  const selectedValue = getSnapSensitivitySliderValue(value);

  return (
    <View className="gap-1 rounded-xl border border-white/10 bg-zinc-900/90 px-3 py-2">
      <Text className="text-xs font-semibold uppercase tracking-[0.8px] text-zinc-400">
        {t("advancedCalibration.snapStrengthTitle")}
      </Text>
      <View className="relative" testID="advanced-snap-sensitivity-track">
        <Slider
          max={2}
          min={0}
          onValueChange={(sliderValue) =>
            onValueChange(getSnapSensitivityFromSliderValue(sliderValue))}
          size="sm"
          step={1}
          testID="advanced-snap-sensitivity-slider"
          value={selectedValue}
        />
        <View
          pointerEvents="none"
          className="absolute inset-x-0 top-3 flex-row items-center justify-between"
          testID="advanced-snap-sensitivity-stops"
        >
          <View
            className="h-2 w-2 rounded-full bg-zinc-500 opacity-0"
            testID="advanced-snap-sensitivity-stop-low"
          />
          <View
            className={`h-2 w-2 rounded-full bg-zinc-500 ${selectedValue >= 1 ? "opacity-0" : ""}`}
            testID="advanced-snap-sensitivity-stop-balanced"
          />
          <View
            className={`h-2 w-2 rounded-full bg-zinc-500 ${selectedValue >= 2 ? "opacity-0" : ""}`}
            testID="advanced-snap-sensitivity-stop-strong"
          />
        </View>
      </View>
      <View className="flex-row justify-between">
        <StopLabel
          isSelected={value === "low"}
          label={t("advancedCalibration.snapStrengthLow")}
        />
        <StopLabel
          isSelected={value === "balanced"}
          label={t("advancedCalibration.snapStrengthBalanced")}
        />
        <StopLabel
          isSelected={value === "strong"}
          label={t("advancedCalibration.snapStrengthStrong")}
        />
      </View>
    </View>
  );
}

interface StopLabelProps {
  isSelected: boolean;
  label: string;
}

function StopLabel({ isSelected, label }: StopLabelProps) {
  return (
    <Text
      className={`text-[10px] font-semibold ${isSelected ? "text-white" : "text-zinc-400"}`}
    >
      {label}
    </Text>
  );
}
