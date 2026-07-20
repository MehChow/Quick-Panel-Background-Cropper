import { Button } from "@/components/ani-ui/button";
import { Lucide } from "@react-native-vector-icons/lucide";
import { useTranslation } from "react-i18next";

interface SourceImageContextToggleProps {
  disabled?: boolean;
  onChange: (value: boolean) => void;
  value: boolean;
}

export function SourceImageContextToggle({
  disabled,
  onChange,
  value,
}: SourceImageContextToggleProps) {
  const { t } = useTranslation();
  return (
    <Button
      accessibilityLabel={t(
        value
          ? "customize.hideSourceImageContext"
          : "customize.showSourceImageContext",
      )}
      accessibilityState={{ selected: value }}
      className="h-12 w-12 rounded-md border border-white/15 bg-black p-0"
      disabled={disabled}
      icon={
        <Lucide color="#ffffff" name={value ? "eye" : "eye-off"} size={20} />
      }
      onPress={() => onChange(!value)}
      testID="source-image-context-toggle"
    />
  );
}
