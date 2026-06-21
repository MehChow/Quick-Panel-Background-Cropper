import { Button } from "@/components/ani-ui/button";
import { Slider } from "@/components/ani-ui/slider";
import { Text } from "@/components/ani-ui/text";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { GridHelpButton } from "./components/GridHelpButton";

interface Props {
  canGoBack: boolean;
  columns: number;
  isConfirmPhase: boolean;
  isGridPhase: boolean;
  isNextDisabled: boolean;
  isOuterPhase: boolean;
  onBack: () => void;
  onColumnsChange: (value: number) => void;
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
  isGridPhase,
  isNextDisabled,
  isOuterPhase,
  onBack,
  onColumnsChange,
  onGridHelpPress,
  onImport,
  onNext,
  onRowsChange,
  onSave,
  rows,
}: Props) {
  const { i18n, t } = useTranslation();
  const [activeAxis, setActiveAxis] = useState<"columns" | "rows">("columns");
  const isEnglish = i18n.resolvedLanguage === "en";
  const columnsLabel = isEnglish ? "Col" : t("advancedCalibration.columns");
  const rowsLabel = isEnglish ? "Row" : t("advancedCalibration.rows");
  const isColumnsActive = activeAxis === "columns";

  return (
    <View className="gap-3 py-4">
      {isGridPhase ? (
        <View className="gap-2 rounded-2xl border border-white/10 bg-zinc-900/90 px-3 py-2.5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold uppercase tracking-[0.8px] text-zinc-400">
              {t("advancedCalibration.gridControlsTitle")}
            </Text>
            <GridHelpButton
              label={t("advancedCalibration.gridHelpButton")}
              onPress={onGridHelpPress}
            />
          </View>
          <View className="flex-row gap-2">
            <AxisChip
              isActive={isColumnsActive}
              label={columnsLabel}
              onPress={() => setActiveAxis("columns")}
              value={columns}
            />
            <AxisChip
              isActive={!isColumnsActive}
              label={rowsLabel}
              onPress={() => setActiveAxis("rows")}
              value={rows}
            />
          </View>
          <GridSlider
            onValueChange={isColumnsActive ? onColumnsChange : onRowsChange}
            value={isColumnsActive ? columns : rows}
          />
        </View>
      ) : null}
      {isOuterPhase ? (
        <View className="flex-row gap-3">
          <Button
            className="flex-1"
            onPress={onImport}
            textClassName="font-semibold"
          >
            {t("calibration.reImport")}
          </Button>
          <Button
            className="flex-1 bg-green-200/90"
            onPress={onNext}
            textClassName="font-semibold text-green-900"
          >
            {t("advancedCalibration.next")}
          </Button>
        </View>
      ) : (
        <View className="flex-row gap-3">
          <Button
            className="flex-1"
            disabled={!canGoBack}
            onPress={onBack}
            textClassName="font-semibold"
          >
            {t("advancedCalibration.back")}
          </Button>
          {isConfirmPhase ? (
            <Button
              className="flex-1 bg-green-200/90 px-0"
              onPress={onSave}
              textClassName="font-semibold text-green-900  w-full"
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

interface AxisChipProps {
  isActive: boolean;
  label: string;
  onPress: () => void;
  value: number;
}
interface GridSliderProps {
  onValueChange: (value: number) => void;
  value: number;
}

function AxisChip({ isActive, label, onPress, value }: AxisChipProps) {
  return (
    <Pressable
      className={`flex-1 rounded-xl px-3 py-2 ${isActive ? "bg-white/10" : "bg-zinc-800/60"}`}
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between">
        <Text
          className={`text-[10px] font-semibold uppercase tracking-[0.8px] ${isActive ? "text-white" : "text-zinc-400"}`}
        >
          {label}
        </Text>
        <Text
          className={`text-sm font-semibold ${isActive ? "text-white" : "text-zinc-300"}`}
        >
          {value}
        </Text>
      </View>
    </Pressable>
  );
}

function GridSlider({ onValueChange, value }: GridSliderProps) {
  return (
    <View className="rounded-xl bg-zinc-800/70 px-3 py-2">
      <Slider
        max={8}
        min={1}
        onValueChange={onValueChange}
        size="sm"
        step={1}
        value={value}
      />
    </View>
  );
}
