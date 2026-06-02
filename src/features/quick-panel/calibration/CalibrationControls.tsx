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
    <View className="flex-row gap-3 py-3">
      <Button
        className="flex-1"
        variant="secondary"
        onPress={onImport}
        textClassName="font-semibold"
      >
        {t("calibration.reImport")}
      </Button>
      <Button
        className="flex-1 bg-orange-200"
        onPress={onContinue}
        textClassName="text-orange-800 font-semibold"
      >
        {t("calibration.looksGood")}
      </Button>
    </View>
  );
}
