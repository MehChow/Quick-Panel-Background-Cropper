import { Switch } from "@/components/ani-ui/switch";
import { Text } from "@/components/ani-ui/text";
import { Lucide } from "@react-native-vector-icons/lucide";
import { useTranslation } from "react-i18next";
import { Pressable, type LayoutChangeEvent, View } from "react-native";
import {
  getButtonIdentifierBackgroundColor,
  type ButtonIdentifierBackgroundTheme,
} from "../button-identifier-color";
import { ButtonAdjustmentTabs } from "./ButtonAdjustmentTabs";

interface ButtonCustomizeControlsProps {
  buttonIdentifierBackgroundTheme: ButtonIdentifierBackgroundTheme;
  buttonIdentifierColor: string;
  buttonPanelOpacity: number;
  hasHorizontalButtons: boolean;
  hasVerticalButtons: boolean;
  horizontalIdentifierPosition: number;
  onOpenButtonIdentifierAppearance: () => void;
  onButtonPanelOpacityChange: (value: number) => void;
  onHorizontalIdentifierPositionChange: (value: number) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  onShowButtonIdentifiersChange: (value: boolean) => void;
  onVerticalIdentifierPositionChange: (value: number) => void;
  showButtonIdentifiers: boolean;
  verticalIdentifierPosition: number;
}

export function getButtonIdentifierColorButtonStyle(
  pressed: boolean,
  disabled = false,
) {
  return { opacity: disabled ? 0.45 : pressed ? 0.6 : 1 };
}

export function ButtonCustomizeControls({
  buttonIdentifierBackgroundTheme,
  buttonIdentifierColor,
  buttonPanelOpacity,
  hasHorizontalButtons,
  hasVerticalButtons,
  horizontalIdentifierPosition,
  onOpenButtonIdentifierAppearance,
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
      className="mt-4 w-full gap-3 rounded-2xl border border-[#f3c992]/25 bg-zinc-950/95 px-4 py-3"
      onLayout={onLayout}
    >
      <View className="flex-row items-center gap-2">
        <View className="min-h-11 flex-1 flex-row items-center justify-between rounded-xl border border-white/20 bg-zinc-800/90 px-3">
          <Text className="flex-1 font-semibold text-white">
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
        <Pressable
          accessibilityLabel={t("customize.chooseButtonIdentifierColor", {
            color: buttonIdentifierColor,
          })}
          accessibilityRole="button"
          accessibilityState={{ disabled: !showButtonIdentifiers }}
          className="h-11 w-11 items-center justify-center rounded-xl border border-white/40"
          disabled={!showButtonIdentifiers}
          onPress={onOpenButtonIdentifierAppearance}
          style={({ pressed }) => [
            { backgroundColor: buttonIdentifierColor },
            getButtonIdentifierColorButtonStyle(pressed, !showButtonIdentifiers),
          ]}
          testID="button-identifier-color-trigger"
        >
          <Lucide
            color={getButtonIdentifierBackgroundColor(
              buttonIdentifierBackgroundTheme,
            )}
            name="palette"
            size={20}
            testID="button-identifier-color-icon"
          />
        </Pressable>
      </View>
      <ButtonAdjustmentTabs
        buttonPanelOpacity={buttonPanelOpacity}
        hasHorizontalButtons={hasHorizontalButtons}
        hasVerticalButtons={hasVerticalButtons}
        horizontalIdentifierPosition={horizontalIdentifierPosition}
        onButtonPanelOpacityChange={onButtonPanelOpacityChange}
        onHorizontalIdentifierPositionChange={onHorizontalIdentifierPositionChange}
        onVerticalIdentifierPositionChange={onVerticalIdentifierPositionChange}
        showButtonIdentifiers={showButtonIdentifiers}
        verticalIdentifierPosition={verticalIdentifierPosition}
      />
    </View>
  );
}
