import { Switch } from "@/components/ani-ui/switch";
import { Text } from "@/components/ani-ui/text";
import { useTranslation } from "react-i18next";
import { type LayoutChangeEvent, View } from "react-native";
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
  onLayout?: (event: LayoutChangeEvent) => void;
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
  onLayout,
  onShowButtonIdentifiersChange,
  onVerticalIdentifierPositionChange,
  showButtonIdentifiers,
  verticalIdentifierPosition,
}: ButtonCustomizeControlsProps) {
  const { t } = useTranslation();
  return (
    <View
      className="mt-4 w-full max-w-md gap-3 rounded-2xl border border-white/10 bg-zinc-900/90 px-4 py-3"
      onLayout={onLayout}
    >
      <View className="min-h-11 flex-row items-center justify-between rounded-xl border border-white/10 bg-zinc-800/70 px-3">
        <Text className="font-semibold text-white">
          {t("customize.showButtonIdentifiers")}
        </Text>
        <Switch
          accessibilityLabel={t("customize.showButtonIdentifiers")}
          offLabel={t("customize.buttonIdentifiersOff")}
          onLabel={t("customize.buttonIdentifiersOn")}
          onValueChange={onShowButtonIdentifiersChange}
          testID="show-button-identifiers-toggle"
          value={showButtonIdentifiers}
        />
      </View>
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
