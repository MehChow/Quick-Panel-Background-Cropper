import { Switch } from "@/components/ani-ui/switch";
import { Text } from "@/components/ani-ui/text";
import { Lucide } from "@react-native-vector-icons/lucide";
import { useTranslation } from "react-i18next";
import { Pressable, type LayoutChangeEvent, View } from "react-native";
import type { ButtonIdentifierTheme } from "../../model/types";
import { ButtonAdjustmentTabs } from "./ButtonAdjustmentTabs";

interface ButtonCustomizeControlsProps {
  buttonIdentifierOpacity: number;
  buttonIdentifierTheme: ButtonIdentifierTheme;
  buttonPanelOpacity: number;
  hasHorizontalButtons: boolean;
  hasVerticalButtons: boolean;
  horizontalIdentifierPosition: number;
  onButtonIdentifierOpacityChange: (value: number) => void;
  onButtonIdentifierThemeChange: (value: ButtonIdentifierTheme) => void;
  onButtonPanelOpacityChange: (value: number) => void;
  onHorizontalIdentifierPositionChange: (value: number) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  onShowButtonIdentifiersChange: (value: boolean) => void;
  onVerticalIdentifierPositionChange: (value: number) => void;
  showButtonIdentifiers: boolean;
  verticalIdentifierPosition: number;
}

export function getButtonIdentifierThemeButtonStyle(
  pressed: boolean,
  disabled = false,
) {
  return { opacity: disabled ? 0.45 : pressed ? 0.6 : 1 };
}

export function ButtonCustomizeControls({
  buttonIdentifierOpacity,
  buttonIdentifierTheme,
  buttonPanelOpacity,
  hasHorizontalButtons,
  hasVerticalButtons,
  horizontalIdentifierPosition,
  onButtonIdentifierOpacityChange,
  onButtonIdentifierThemeChange,
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
          accessibilityLabel={t("customize.buttonIdentifierThemeToggle")}
          accessibilityRole="switch"
          accessibilityState={{ checked: buttonIdentifierTheme === "dark" }}
          className={`h-11 w-11 items-center justify-center rounded-xl border ${
            buttonIdentifierTheme === "light"
              ? "border-[#f3c992]/60 bg-[#f5d6aa]"
              : "border-[#f3c992]/60 bg-[#2c2328]"
          }`}
          disabled={!showButtonIdentifiers}
          onPress={() => onButtonIdentifierThemeChange(
            buttonIdentifierTheme === "light" ? "dark" : "light",
          )}
          style={({ pressed }) => getButtonIdentifierThemeButtonStyle(
            pressed,
            !showButtonIdentifiers,
          )}
          testID="button-identifier-theme-toggle"
        >
          <Lucide
            color={buttonIdentifierTheme === "light" ? "#261e1e" : "#f5d6aa"}
            name={buttonIdentifierTheme === "light" ? "sun" : "moon"}
            size={20}
            testID="button-identifier-theme-icon"
          />
        </Pressable>
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
