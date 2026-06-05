import { Button } from "@/components/ani-ui/button";
import { Card } from "@/components/ani-ui/card";
import { Text } from "@/components/ani-ui/text";
import type { CustomCalibrationSourceMode } from "@/features/quick-panel/model/types";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface EntryStepperProps {
  mode: "entry";
  onSelectSourceMode: (mode: CustomCalibrationSourceMode) => void;
  sourceMode: CustomCalibrationSourceMode;
}

interface AlignmentStepperProps {
  hasBottomScreenshot: boolean;
  mode: "alignment";
  onAddSecondScreenshot: () => void;
  onContinue: () => void;
}

interface PanelStepperProps {
  canGoBack: boolean;
  isHidden: boolean;
  isLastStep: boolean;
  mode: "panel";
  onBack: () => void;
  onMarkHidden: () => void;
  onMarkPresent: () => void;
  onNext: () => void;
  panelLabel: string;
  stepCount: number;
  stepIndex: number;
}

type CustomCalibrationStepperProps =
  | AlignmentStepperProps
  | EntryStepperProps
  | PanelStepperProps;

export function CustomCalibrationStepper(props: CustomCalibrationStepperProps) {
  const { t } = useTranslation();

  return (
    <Card className="gap-4 rounded-2xl border-zinc-800 bg-zinc-900">
      {props.mode === "entry" ? (
        <View className="gap-3">
          <Text className="text-lg font-semibold text-white">
            {t("calibration.importTitle")}
          </Text>
          <View className="gap-3">
            <Button
              className={
                props.sourceMode === "single" ? "w-full bg-orange-100" : "w-full"
              }
              onPress={() => props.onSelectSourceMode("single")}
              textClassName={
                props.sourceMode === "single"
                  ? "font-semibold text-orange-800"
                  : "font-semibold"
              }
            >
              {t("calibration.continueWithOneScreenshot")}
            </Button>
            <Button
              className={
                props.sourceMode === "double" ? "w-full bg-orange-100" : "w-full"
              }
              onPress={() => props.onSelectSourceMode("double")}
              textClassName={
                props.sourceMode === "double"
                  ? "font-semibold text-orange-800"
                  : "font-semibold"
              }
            >
              {t("calibration.addSecondScreenshot")}
            </Button>
          </View>
        </View>
      ) : null}
      {props.mode === "alignment" ? (
        <View className="gap-3">
          <Text className="text-lg font-semibold text-white">
            {t("calibration.alignOverlap")}
          </Text>
          <View className="gap-3">
            <Button
              className="w-full"
              onPress={props.onAddSecondScreenshot}
              textClassName="font-semibold"
            >
              {t("calibration.addSecondScreenshot")}
            </Button>
            {props.hasBottomScreenshot ? (
              <Button
                className="w-full bg-green-200/90"
                onPress={props.onContinue}
                textClassName="font-semibold text-green-900"
              >
                {t("calibration.alignOverlap")}
              </Button>
            ) : null}
          </View>
        </View>
      ) : null}
      {props.mode === "panel" ? (
        <View className="gap-4">
          <View className="gap-1">
            <Text className="text-sm font-semibold text-orange-300">
              {t("calibration.panelStepCounter", {
                current: props.stepIndex + 1,
                total: props.stepCount,
              })}
            </Text>
            <Text className="text-lg font-semibold text-white">
              {props.panelLabel}
            </Text>
            <Text className="text-sm leading-5 text-zinc-400">
              {t("calibration.panelStepSubtitle", { panel: props.panelLabel })}
            </Text>
          </View>
          <View className="gap-3">
            <Button
              className={props.isHidden ? "w-full bg-orange-100" : "w-full"}
              onPress={props.isHidden ? props.onMarkPresent : props.onMarkHidden}
              textClassName={
                props.isHidden ? "font-semibold text-orange-800" : "font-semibold"
              }
            >
              {props.isHidden ? t("calibration.useBox") : t("calibration.markHidden")}
            </Button>
            <View className="flex-row gap-3">
              <Button
                className="flex-1"
                onPress={props.onBack}
                disabled={!props.canGoBack}
                textClassName="font-semibold"
              >
                {t("common.back")}
              </Button>
              <Button
                className="flex-1 bg-green-200/90"
                onPress={props.onNext}
                textClassName="font-semibold text-green-900"
              >
                {props.isLastStep
                  ? t("calibration.reviewCustomLayout")
                  : t("common.next")}
              </Button>
            </View>
          </View>
        </View>
      ) : null}
    </Card>
  );
}
