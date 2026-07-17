import { Slider } from "@/components/ani-ui/slider";
import { Text } from "@/components/ani-ui/text";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

interface ButtonCustomizeControlsProps {
  buttonIdentifierOpacity: number;
  buttonPanelOpacity: number;
  onButtonIdentifierOpacityChange: (value: number) => void;
  onButtonPanelOpacityChange: (value: number) => void;
  onShowButtonIdentifiersChange: (value: boolean) => void;
  showButtonIdentifiers: boolean;
}

interface OpacityControlProps {
  disabled?: boolean;
  label: string;
  onValueChange: (value: number) => void;
  testID: string;
  value: number;
}

function OpacityControl({
  disabled,
  label,
  onValueChange,
  testID,
  value,
}: OpacityControlProps) {
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-semibold uppercase tracking-[0.8px] text-zinc-400">
          {label}
        </Text>
        <Text className="text-sm font-semibold text-white">{value}%</Text>
      </View>
      <View className="rounded-xl bg-zinc-800/70 px-3 py-2">
        <Slider
          disabled={disabled}
          max={100}
          min={0}
          onValueChange={onValueChange}
          size="sm"
          step={1}
          testID={testID}
          value={value}
        />
      </View>
    </View>
  );
}

export function ButtonCustomizeControls({
  buttonIdentifierOpacity,
  buttonPanelOpacity,
  onButtonIdentifierOpacityChange,
  onButtonPanelOpacityChange,
  onShowButtonIdentifiersChange,
  showButtonIdentifiers,
}: ButtonCustomizeControlsProps) {
  const { t } = useTranslation();
  return (
    <View className="mt-4 w-full max-w-md gap-4 rounded-2xl border border-white/10 bg-zinc-900/90 px-4 py-3">
      <OpacityControl
        label={t("customize.buttonPanelOpacity")}
        onValueChange={onButtonPanelOpacityChange}
        testID="button-panel-opacity-slider"
        value={buttonPanelOpacity}
      />
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: showButtonIdentifiers }}
        className={`flex-row items-center justify-between rounded-xl border px-3 py-3 ${
          showButtonIdentifiers
            ? "border-emerald-300/40 bg-emerald-300/10"
            : "border-white/10 bg-zinc-800/70"
        }`}
        onPress={() => onShowButtonIdentifiersChange(!showButtonIdentifiers)}
      >
        <Text className="font-semibold text-white">
          {t("customize.showButtonIdentifiers")}
        </Text>
        <Text className={`text-xs font-semibold uppercase ${
          showButtonIdentifiers ? "text-emerald-200" : "text-zinc-500"
        }`}>
          {t(showButtonIdentifiers
            ? "customize.buttonIdentifiersOn"
            : "customize.buttonIdentifiersOff")}
        </Text>
      </Pressable>
      <View
        className={showButtonIdentifiers ? "" : "opacity-50"}
        testID="button-identifier-opacity-control"
      >
        <OpacityControl
          disabled={!showButtonIdentifiers}
          label={t("customize.buttonIdentifierOpacity")}
          onValueChange={onButtonIdentifierOpacityChange}
          testID="button-identifier-opacity-slider"
          value={buttonIdentifierOpacity}
        />
      </View>
    </View>
  );
}
