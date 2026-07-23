import { Button } from "@/components/ani-ui/button";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { AdvancedGridControls } from "./components/AdvancedGridControls";

interface Props {
  canGoBack: boolean;
  columns: number;
  isConfirmPhase: boolean;
  isGridEnabled: boolean;
  isGridPhase: boolean;
  isNextDisabled: boolean;
  isOuterPhase: boolean;
  onBack: () => void;
  onColumnsChange: (value: number) => void;
  onGridEnabledChange: (enabled: boolean) => void;
  onGridHelpPress: () => void;
  onImport: () => void;
  onNext: () => void;
  onRowsChange: (value: number) => void;
  onSave: () => void;
  rows: number;
}

export function AdvancedCalibrationControls({
  canGoBack,
  columns,
  isConfirmPhase,
  isGridEnabled,
  isGridPhase,
  isNextDisabled,
  isOuterPhase,
  onBack,
  onColumnsChange,
  onGridEnabledChange,
  onGridHelpPress,
  onImport,
  onNext,
  onRowsChange,
  onSave,
  rows,
}: Props) {
  const { t } = useTranslation();

  return (
    <View className="gap-3 py-4">
      {isGridPhase ? (
        <AdvancedGridControls
          columns={columns}
          isGridEnabled={isGridEnabled}
          onColumnsChange={onColumnsChange}
          onGridEnabledChange={onGridEnabledChange}
          onGridHelpPress={onGridHelpPress}
          onRowsChange={onRowsChange}
          rows={rows}
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
