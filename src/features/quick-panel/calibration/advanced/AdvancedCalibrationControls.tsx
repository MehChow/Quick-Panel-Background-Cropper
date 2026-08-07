import { Button } from "@/components/ani-ui/button";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { AdvancedGridControls } from "./components/AdvancedGridControls";
import { AdvancedSnapSensitivityControl } from "./components/AdvancedSnapSensitivityControl";
import type { SnapSensitivity } from "../../model/snap-sensitivity";

interface Props {
  canGoBack: boolean;
  columns: number;
  isConfirmPhase: boolean;
  isGridPhase: boolean;
  isNextDisabled: boolean;
  isOuterPhase: boolean;
  isPanelPhase: boolean;
  onBack: () => void;
  onColumnsChange: (value: number) => void;
  onGridHelpPress: () => void;
  onImport: () => void;
  onNext: () => void;
  onRowsChange: (value: number) => void;
  onSave: () => void;
  onSnapSensitivityChange: (value: SnapSensitivity) => void;
  rows: number;
  snapSensitivity: SnapSensitivity;
}

export function AdvancedCalibrationControls({
  canGoBack,
  columns,
  isConfirmPhase,
  isGridPhase,
  isNextDisabled,
  isOuterPhase,
  isPanelPhase,
  onBack,
  onColumnsChange,
  onGridHelpPress,
  onImport,
  onNext,
  onRowsChange,
  onSave,
  onSnapSensitivityChange,
  rows,
  snapSensitivity,
}: Props) {
  const { t } = useTranslation();

  return (
    <View className="gap-3 py-4">
      {isGridPhase ? (
        <AdvancedGridControls
          columns={columns}
          onColumnsChange={onColumnsChange}
          onGridHelpPress={onGridHelpPress}
          onRowsChange={onRowsChange}
          rows={rows}
        />
      ) : null}
      {isPanelPhase ? (
        <AdvancedSnapSensitivityControl
          onValueChange={onSnapSensitivityChange}
          value={snapSensitivity}
        />
      ) : null}
      {isOuterPhase ? (
        <View className="flex-row gap-3">
          <Button
            className="flex-1 bg-white"
            onPress={onImport}
            textClassName="font-semibold text-black"
          >
            {t("calibration.reImport")}
          </Button>
          <Button
            className="flex-1 bg-green-200/90 px-0"
            onPress={onNext}
            textClassName="font-semibold text-green-900 w-full"
          >
            {t("advancedCalibration.next")}
          </Button>
        </View>
      ) : (
        <View className="flex-row gap-3">
          <Button
            className="flex-1 bg-white"
            disabled={!canGoBack}
            onPress={onBack}
            textClassName="font-semibold text-black"
          >
            {t("advancedCalibration.back")}
          </Button>
          {isConfirmPhase ? (
            <Button
              className="flex-1 bg-green-200/90 px-0"
              onPress={onSave}
              textClassName="font-semibold text-green-900 w-full"
            >
              {t("common.confirm")}
            </Button>
          ) : (
            <Button
              className="flex-1 bg-green-200/90 px-0"
              disabled={isNextDisabled}
              onPress={onNext}
              textClassName="font-semibold text-green-900 w-full"
            >
              {t("advancedCalibration.next")}
            </Button>
          )}
        </View>
      )}
    </View>
  );
}
