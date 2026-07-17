import { Text } from "@/components/ani-ui/text";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { ButtonAdjustmentTabs } from "./ButtonAdjustmentTabs";

interface ButtonCustomizeControlsProps {
  buttonIdentifierOpacity: number;
  buttonPanelOpacity: number;
  hasHorizontalButtons: boolean;
  hasVerticalButtons: boolean;
  horizontalIdentifierPosition: number;
  onButtonIdentifierOpacityChange: (value: number) => void;
  onButtonPanelOpacityChange: (value: number) => void;
  onHorizontalIdentifierPositionChange: (value: number) => void;
  onShowButtonIdentifiersChange: (value: boolean) => void;
  onVerticalIdentifierPositionChange: (value: number) => void;
  showButtonIdentifiers: boolean;
  verticalIdentifierPosition: number;
}

export function ButtonCustomizeControls({
  buttonIdentifierOpacity,
  buttonPanelOpacity,
  hasHorizontalButtons,
  hasVerticalButtons,
  horizontalIdentifierPosition,
  onButtonIdentifierOpacityChange,
  onButtonPanelOpacityChange,
  onHorizontalIdentifierPositionChange,
  onShowButtonIdentifiersChange,
  onVerticalIdentifierPositionChange,
  showButtonIdentifiers,
  verticalIdentifierPosition,
}: ButtonCustomizeControlsProps) {
  const { t } = useTranslation();
  return (
    <View className="mt-4 w-full max-w-md gap-3 rounded-2xl border border-white/10 bg-zinc-900/90 px-4 py-3">
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: showButtonIdentifiers }}
        className={`min-h-11 flex-row items-center justify-between rounded-xl border px-3 ${
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
      <ButtonAdjustmentTabs
        buttonIdentifierOpacity={buttonIdentifierOpacity}
        buttonPanelOpacity={buttonPanelOpacity}
        hasHorizontalButtons={hasHorizontalButtons}
        hasVerticalButtons={hasVerticalButtons}
        horizontalIdentifierPosition={horizontalIdentifierPosition}
        onButtonIdentifierOpacityChange={onButtonIdentifierOpacityChange}
        onButtonPanelOpacityChange={onButtonPanelOpacityChange}
        onHorizontalIdentifierPositionChange={onHorizontalIdentifierPositionChange}
        onVerticalIdentifierPositionChange={onVerticalIdentifierPositionChange}
        showButtonIdentifiers={showButtonIdentifiers}
        verticalIdentifierPosition={verticalIdentifierPosition}
      />
    </View>
  );
}
