import { Button } from "@/components/ani-ui/button";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface Props {
  canGoBack: boolean;
  isConfirmPhase: boolean;
  isOuterPhase: boolean;
  onBack: () => void;
  onImport: () => void;
  onNext: () => void;
  onSave: () => void;
}

export function AdvancedCalibrationControls({
  canGoBack,
  isConfirmPhase,
  isOuterPhase,
  onBack,
  onImport,
  onNext,
  onSave,
}: Props) {
  const { t } = useTranslation();

  return (
    <View className="gap-3 py-4">
      {isOuterPhase ? (
        <View className="flex-row gap-3">
          <Button className="flex-1" onPress={onImport} textClassName="font-semibold">
            {t("calibration.reImport")}
          </Button>
          <Button className="flex-1 bg-green-200/90" onPress={onNext} textClassName="font-semibold text-green-900">
            {t("advancedCalibration.next")}
          </Button>
        </View>
      ) : (
        <View className="flex-row gap-3">
          <Button className="flex-1" disabled={!canGoBack} onPress={onBack} textClassName="font-semibold">
            {t("advancedCalibration.back")}
          </Button>
          {isConfirmPhase ? (
            <Button className="flex-1 bg-green-200/90" onPress={onSave} textClassName="font-semibold text-green-900">
              {t("common.confirm")}
            </Button>
          ) : (
            <Button className="flex-1 bg-green-200/90" onPress={onNext} textClassName="font-semibold text-green-900">
              {t("advancedCalibration.next")}
            </Button>
          )}
        </View>
      )}
    </View>
  );
}
