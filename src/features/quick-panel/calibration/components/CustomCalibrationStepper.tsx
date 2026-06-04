import { Button } from "@/components/ani-ui/button";
import { Card } from "@/components/ani-ui/card";
import { Text } from "@/components/ani-ui/text";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface CustomCalibrationStepperProps {
  canGoBack: boolean;
  isHidden: boolean;
  isLastStep: boolean;
  onBack: () => void;
  onMarkHidden: () => void;
  onMarkPresent: () => void;
  onNext: () => void;
  panelLabel: string;
  stepCount: number;
  stepIndex: number;
}

export function CustomCalibrationStepper({
  canGoBack,
  isHidden,
  isLastStep,
  onBack,
  onMarkHidden,
  onMarkPresent,
  onNext,
  panelLabel,
  stepCount,
  stepIndex,
}: CustomCalibrationStepperProps) {
  const { t } = useTranslation();

  return (
    <Card className="gap-4 rounded-2xl border-zinc-800 bg-zinc-900">
      <View className="gap-1">
        <Text className="text-sm font-semibold text-orange-300">
          {t("calibration.panelStepCounter", {
            current: stepIndex + 1,
            total: stepCount,
          })}
        </Text>
        <Text className="text-lg font-semibold text-white">{panelLabel}</Text>
        <Text className="text-sm leading-5 text-zinc-400">
          {t("calibration.panelStepSubtitle", { panel: panelLabel })}
        </Text>
      </View>

      <View className="gap-3">
        <Button
          className={isHidden ? "w-full bg-orange-100" : "w-full"}
          onPress={isHidden ? onMarkPresent : onMarkHidden}
          textClassName={isHidden ? "font-semibold text-orange-800" : "font-semibold"}
        >
          {isHidden ? t("calibration.useBox") : t("calibration.markHidden")}
        </Button>
        <View className="flex-row gap-3">
          <Button
            className="flex-1"
            onPress={onBack}
            disabled={!canGoBack}
            textClassName="font-semibold"
          >
            {t("common.back")}
          </Button>
          <Button
            className="flex-1 bg-green-200/90"
            onPress={onNext}
            textClassName="font-semibold text-green-900"
          >
            {isLastStep
              ? t("calibration.reviewCustomLayout")
              : t("common.next")}
          </Button>
        </View>
      </View>
    </Card>
  );
}
