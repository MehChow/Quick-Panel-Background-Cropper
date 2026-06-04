import { Button } from "@/components/ani-ui/button";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import type { AdvancedCalibrationPhase } from "./hooks/useAdvancedCalibrationScreen";

interface Props {
  phase: AdvancedCalibrationPhase;
  onBack: () => void;
  onContinue: () => void;
  onImport: () => void;
  onSave: () => void;
}

export function AdvancedCalibrationControls({
  phase,
  onBack,
  onContinue,
  onImport,
  onSave,
}: Props) {
  const { t } = useTranslation();
  return (
    <View className="gap-3 py-4">
      <View className="flex-row gap-3">
        <Button className="flex-1" onPress={onImport} textClassName="font-semibold">
          {t("calibration.reImport")}
        </Button>
        {phase === "outer" ? (
          <Button className="flex-1 bg-green-200/90" onPress={onContinue} textClassName="font-semibold text-green-900">
            {t("advancedCalibration.adjustPanels")}
          </Button>
        ) : (
          <Button className="flex-1 bg-green-200/90" onPress={onSave} textClassName="font-semibold text-green-900">
            {t("advancedCalibration.save")}
          </Button>
        )}
      </View>
      {phase === "panels" ? (
        <Button onPress={onBack} textClassName="font-semibold">
          {t("advancedCalibration.adjustOuter")}
        </Button>
      ) : null}
    </View>
  );
}
