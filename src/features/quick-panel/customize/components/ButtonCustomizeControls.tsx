import { Separator } from "@/components/ani-ui/separator";
import { Text } from "@/components/ani-ui/text";
import { ToggleGroup, ToggleGroupItem } from "@/components/ani-ui/toggle-group";
import { Lucide } from "@react-native-vector-icons/lucide";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View, type LayoutChangeEvent } from "react-native";
import {
  buttonIdentifierContentModes,
  normalizeButtonIdentifierContentMode,
  type ButtonIdentifierContentMode,
} from "../../model/button-identifier-content";
import {
  getButtonIdentifierBackgroundColor,
  type ButtonIdentifierBackgroundTheme,
} from "../button-identifier-color";
import { ButtonAdjustmentTabs } from "./ButtonAdjustmentTabs";

const buttonIdentifierContentIcons = {
  both: "scan-text",
  icon: "image",
  none: "eye-off",
} as const;

interface ButtonCustomizeControlsProps {
  buttonIdentifierBackgroundTheme: ButtonIdentifierBackgroundTheme;
  buttonIdentifierColor: string;
  buttonIdentifierContentMode: ButtonIdentifierContentMode;
  buttonPanelOpacity: number;
  hasHorizontalButtons: boolean;
  hasVerticalButtons: boolean;
  horizontalIdentifierPosition: number;
  onOpenButtonIdentifierAppearance: () => void;
  onButtonPanelOpacityChange: (value: number) => void;
  onButtonPanelOpacityCommit: (value: number) => void;
  onHorizontalIdentifierPositionChange: (value: number) => void;
  onHorizontalIdentifierPositionCommit: (value: number) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  onButtonIdentifierContentModeChange: (
    value: ButtonIdentifierContentMode,
  ) => void;
  onVerticalIdentifierPositionChange: (value: number) => void;
  onVerticalIdentifierPositionCommit: (value: number) => void;
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
  buttonIdentifierContentMode,
  buttonPanelOpacity,
  hasHorizontalButtons,
  hasVerticalButtons,
  horizontalIdentifierPosition,
  onOpenButtonIdentifierAppearance,
  onButtonPanelOpacityChange,
  onButtonPanelOpacityCommit,
  onHorizontalIdentifierPositionChange,
  onHorizontalIdentifierPositionCommit,
  onLayout,
  onButtonIdentifierContentModeChange,
  onVerticalIdentifierPositionChange,
  onVerticalIdentifierPositionCommit,
  verticalIdentifierPosition,
}: ButtonCustomizeControlsProps) {
  const { t } = useTranslation();
  const identifiersHidden = buttonIdentifierContentMode === "none";
  const handleContentModeChange = (value: string) => {
    const mode = normalizeButtonIdentifierContentMode(value);
    if (mode) {
      onButtonIdentifierContentModeChange(mode);
    }
  };
  return (
    <View
      className="mt-4 w-full gap-3 rounded-2xl border border-[#f3c992]/25 bg-zinc-950/95 px-4 py-3"
      onLayout={onLayout}
    >
      <View
        className="flex-row items-center gap-2"
        testID="button-identifier-content-row"
      >
        <View className="min-w-0 min-h-11 flex-1 flex-row items-center gap-2 rounded-xl border border-white/20 bg-zinc-800/90 pl-3">
          <Text
            className="min-w-0 flex-1 font-semibold text-white"
            testID="button-identifier-content-title"
          >
            {t("customize.buttonIdentifierContentTitle")}
          </Text>
          <ToggleGroup
            accessibilityLabel={t("customize.buttonIdentifierContentTitle")}
            className="shrink-0 gap-0"
            onValueChange={handleContentModeChange}
            value={buttonIdentifierContentMode}
          >
            {buttonIdentifierContentModes.map((mode, index) => {
              const isSelected = buttonIdentifierContentMode === mode;
              const labelKey = `customize.buttonIdentifierContent${
                mode === "both" ? "Both" : mode === "icon" ? "Icon" : "None"
              }` as const;
              const accessibilityKey = `${labelKey}Accessibility` as const;
              return (
                <Fragment key={mode}>
                  {index > 0 ? (
                    <Separator
                      className="h-5 self-center bg-white/20"
                      testID={`button-content-separator-${index}`}
                      orientation="vertical"
                    />
                  ) : null}
                  <ToggleGroupItem
                    accessibilityLabel={t(accessibilityKey)}
                    className="h-11 min-h-0 min-w-0 w-10 bg-transparent p-0"
                    testID={`button-content-${mode}`}
                    value={mode}
                  >
                    <Lucide
                      color={isSelected ? "#f5d6aa" : "#000000"}
                      name={buttonIdentifierContentIcons[mode]}
                      size={20}
                      testID={`button-content-${mode}-icon`}
                    />
                  </ToggleGroupItem>
                </Fragment>
              );
            })}
          </ToggleGroup>
        </View>
        <Pressable
          accessibilityLabel={t("customize.chooseButtonIdentifierColor", {
            color: buttonIdentifierColor,
          })}
          accessibilityRole="button"
          accessibilityState={{ disabled: identifiersHidden }}
          className="h-11 w-11 items-center justify-center rounded-xl border border-white/40"
          disabled={identifiersHidden}
          onPress={onOpenButtonIdentifierAppearance}
          style={({ pressed }) => [
            { backgroundColor: buttonIdentifierColor },
            getButtonIdentifierColorButtonStyle(pressed, identifiersHidden),
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
        onButtonPanelOpacityCommit={onButtonPanelOpacityCommit}
        onHorizontalIdentifierPositionChange={
          onHorizontalIdentifierPositionChange
        }
        onHorizontalIdentifierPositionCommit={
          onHorizontalIdentifierPositionCommit
        }
        onVerticalIdentifierPositionChange={onVerticalIdentifierPositionChange}
        onVerticalIdentifierPositionCommit={onVerticalIdentifierPositionCommit}
        buttonIdentifierContentMode={buttonIdentifierContentMode}
        verticalIdentifierPosition={verticalIdentifierPosition}
      />
    </View>
  );
}
