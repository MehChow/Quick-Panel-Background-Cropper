import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSharedValue } from "react-native-reanimated";
import {
  colorKit,
  type ColorFormatsObject,
  type ColorPickerRef,
} from "reanimated-color-picker";
import {
  getButtonIdentifierBackgroundColor,
  normalizeButtonIdentifierColor,
  type ButtonIdentifierAppearance,
  type ButtonIdentifierBackgroundTheme,
} from "../button-identifier-color";
import type { AnimatedButtonIdentifierAppearance } from "../components/button-identifier-animated-appearance";

interface ButtonLabelAppearanceDraft {
  animatedAppearance: AnimatedButtonIdentifierAppearance;
  backgroundTheme: ButtonIdentifierBackgroundTheme;
  confirmDisabled: boolean;
  error: string | null;
  handleHexChange: (text: string) => void;
  handleBackgroundThemeChange: (
    theme: ButtonIdentifierBackgroundTheme,
  ) => void;
  handlePickerChange: (colors: ColorFormatsObject) => void;
  handlePickerComplete: (colors: ColorFormatsObject) => void;
  hexText: string;
  pickerRef: React.RefObject<ColorPickerRef | null>;
  readConfirmedAppearance: () => ButtonIdentifierAppearance;
}

export function useButtonLabelAppearanceDraft(
  color: string,
  opacity: number,
  backgroundTheme: ButtonIdentifierBackgroundTheme,
): ButtonLabelAppearanceDraft {
  const { t } = useTranslation();
  const draftColor = useSharedValue<string>(color);
  const draftCircleColor = useSharedValue<string>(
    getButtonIdentifierBackgroundColor(backgroundTheme),
  );
  const draftOpacity = useSharedValue(opacity / 100);
  const latestValidDraft = useRef<ButtonIdentifierAppearance>({
    backgroundTheme,
    color,
    opacity,
  });
  const pickerRef = useRef<ColorPickerRef>(null);
  const [hexText, setHexText] = useState(color);
  const [error, setError] = useState<string | null>(null);
  const [draftBackgroundTheme, setDraftBackgroundTheme] =
    useState(backgroundTheme);

  const handlePickerChange = (colors: ColorFormatsObject) => {
    "worklet";
    const nextColor = colorKit.runOnUI().HEX(colors.rgba, false).toUpperCase();
    const nextAlpha = colorKit.runOnUI().RGB(colors.rgba).object(false).a;
    draftColor.value = nextColor;
    draftOpacity.value = nextAlpha;
  };
  const handlePickerComplete = (colors: ColorFormatsObject) => {
    const nextColor = normalizeButtonIdentifierColor(
      colorKit.HEX(colors.rgba, false),
    ) ?? color;
    const nextOpacity = Math.round(colorKit.getAlpha(colors.rgba) * 100);
    latestValidDraft.current = {
      ...latestValidDraft.current,
      color: nextColor,
      opacity: nextOpacity,
    };
    setHexText(nextColor);
    setError(null);
  };
  const handleHexChange = (text: string) => {
    setHexText(text);
    const normalized = normalizeButtonIdentifierColor(text);
    if (!normalized) {
      setError(t("customize.invalidButtonIdentifierHex"));
      return;
    }
    const currentOpacity = latestValidDraft.current.opacity;
    latestValidDraft.current = {
      ...latestValidDraft.current,
      color: normalized,
      opacity: currentOpacity,
    };
    draftColor.value = normalized;
    draftOpacity.value = currentOpacity / 100;
    pickerRef.current?.setColor(
      colorKit.setAlpha(normalized, currentOpacity / 100).rgb().string(true),
      0,
    );
    setError(null);
  };
  const handleBackgroundThemeChange = (
    theme: ButtonIdentifierBackgroundTheme,
  ) => {
    latestValidDraft.current = {
      ...latestValidDraft.current,
      backgroundTheme: theme,
    };
    setDraftBackgroundTheme(theme);
    draftCircleColor.value = getButtonIdentifierBackgroundColor(theme);
  };

  return {
    animatedAppearance: {
      circleColor: draftCircleColor,
      color: draftColor,
      opacity: draftOpacity,
    },
    backgroundTheme: draftBackgroundTheme,
    confirmDisabled: error !== null,
    error,
    handleBackgroundThemeChange,
    handleHexChange,
    handlePickerChange,
    handlePickerComplete,
    hexText,
    pickerRef,
    readConfirmedAppearance: () => latestValidDraft.current,
  };
}
