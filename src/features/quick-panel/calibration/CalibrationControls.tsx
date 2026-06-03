import { Button } from "@/components/ani-ui/button";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface CalibrationControlsProps {
  onContinue: () => void;
  onImport: () => void;
}

export function CalibrationControls({
  onContinue,
  onImport,
}: CalibrationControlsProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row gap-3 py-4">
      <Button
        className="flex-1"
        onPress={onImport}
        textClassName="font-semibold"
      >
        {t("calibration.reImport")}
      </Button>
      <Button
        className="flex-1 bg-green-200/90"
        onPress={onContinue}
        textClassName="font-semibold text-green-900"
      >
        {t("calibration.looksGood")}
      </Button>
    </View>
  );
}
