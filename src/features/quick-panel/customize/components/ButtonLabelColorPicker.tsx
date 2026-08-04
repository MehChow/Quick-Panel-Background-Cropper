import { Input } from "@/components/ani-ui/input";
import { Text } from "@/components/ani-ui/text";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import ColorPicker, {
  Panel3,
  type ColorFormatsObject,
  type ColorPickerRef,
} from "reanimated-color-picker";
import type { ButtonIdentifierBackgroundTheme } from "../button-identifier-color";
import { ButtonIdentifierBackgroundThemeToggle } from "./ButtonIdentifierBackgroundThemeToggle";
import { ButtonLabelAdjustmentTabs } from "./ButtonLabelAdjustmentTabs";

interface ButtonLabelColorPickerProps {
  backgroundTheme: ButtonIdentifierBackgroundTheme;
  error: string | null;
  hexText: string;
  initialValue: string;
  onChange: (colors: ColorFormatsObject) => void;
  onComplete: (colors: ColorFormatsObject) => void;
  onHexChange: (text: string) => void;
  onBackgroundThemeChange: (theme: ButtonIdentifierBackgroundTheme) => void;
  onInteractionEnd: () => void;
  onInteractionStart: () => void;
  pickerRef: React.RefObject<ColorPickerRef | null>;
}

export function ButtonLabelColorPicker({
  backgroundTheme,
  error,
  hexText,
  initialValue,
  onChange,
  onComplete,
  onHexChange,
  onBackgroundThemeChange,
  onInteractionEnd,
  onInteractionStart,
  pickerRef,
}: ButtonLabelColorPickerProps) {
  const { t } = useTranslation();
  const handlePickerComplete = (colors: ColorFormatsObject) => {
    onComplete(colors);
    onInteractionEnd();
  };
  return (
    <View className="gap-2">
      <View
        onTouchCancel={onInteractionEnd}
        onTouchEnd={onInteractionEnd}
        onTouchStart={onInteractionStart}
        testID="button-label-picker-gesture-region"
      >
        <ColorPicker
          ref={pickerRef}
          onChange={onChange}
          onCompleteJS={handlePickerComplete}
          sliderThickness={12}
          thumbSize={28}
          thumbStyle={{ borderColor: "#FFFFFF", borderWidth: 2 }}
          value={initialValue}
        >
          <Panel3
            accessibilityLabel={t("customize.buttonIdentifierColorWheel")}
            style={{ alignSelf: "center", height: 150, width: 150 }}
          />
          <View className="mt-4" testID="button-label-adjustment-tabs">
            <ButtonLabelAdjustmentTabs />
          </View>
        </ColorPicker>
      </View>
      <Text className="text-xs font-semibold text-zinc-300">
        {t("customize.buttonIdentifierHex")}
      </Text>
      <View
        className="flex-row items-center gap-2"
        testID="button-identifier-hex-theme-row"
      >
        <Input
          accessibilityLabel={t("customize.buttonIdentifierHex")}
          autoCapitalize="characters"
          className="flex-1 border-white/20 bg-zinc-900 text-white"
          onChangeText={onHexChange}
          placeholder="#RRGGBB"
          testID="button-identifier-hex-input"
          value={hexText}
        />
        <ButtonIdentifierBackgroundThemeToggle
          onChange={onBackgroundThemeChange}
          theme={backgroundTheme}
        />
      </View>
      {error ? <Text className="text-sm text-red-300">{error}</Text> : null}
    </View>
  );
}
