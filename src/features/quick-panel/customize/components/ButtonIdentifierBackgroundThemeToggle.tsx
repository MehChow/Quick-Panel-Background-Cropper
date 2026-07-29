import { Lucide } from "@react-native-vector-icons/lucide";
import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";
import {
  getButtonIdentifierBackgroundColor,
  type ButtonIdentifierBackgroundTheme,
} from "../button-identifier-color";

interface ButtonIdentifierBackgroundThemeToggleProps {
  onChange: (theme: ButtonIdentifierBackgroundTheme) => void;
  theme: ButtonIdentifierBackgroundTheme;
}

export function ButtonIdentifierBackgroundThemeToggle({
  onChange,
  theme,
}: ButtonIdentifierBackgroundThemeToggleProps) {
  const { t } = useTranslation();
  const themeLabel = t(
    theme === "light"
      ? "customize.buttonIdentifierBackgroundLight"
      : "customize.buttonIdentifierBackgroundDark",
  );
  return (
    <Pressable
      accessibilityHint={t(
        "customize.toggleButtonIdentifierBackgroundTheme",
      )}
      accessibilityLabel={t(
        "customize.buttonIdentifierBackgroundThemeChoice",
        { theme: themeLabel },
      )}
      accessibilityRole="button"
      className="h-11 w-11 items-center justify-center rounded-full border border-white/40"
      onPress={() => onChange(theme === "light" ? "dark" : "light")}
      style={{ backgroundColor: getButtonIdentifierBackgroundColor(theme) }}
      testID="button-identifier-background-theme-toggle"
    >
      <Lucide
        color={theme === "light" ? "#18181B" : "#FFFFFF"}
        name={theme === "light" ? "sun" : "moon"}
        size={20}
      />
    </Pressable>
  );
}
