import { Slider } from "@/components/ani-ui/slider";
import { Switch } from "@/components/ani-ui/switch";
import { Text } from "@/components/ani-ui/text";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { GridHelpButton } from "./GridHelpButton";

interface Props {
  columns: number;
  isGridEnabled: boolean;
  onColumnsChange: (value: number) => void;
  onGridEnabledChange: (enabled: boolean) => void;
  onGridHelpPress: () => void;
  onRowsChange: (value: number) => void;
  rows: number;
}

export function AdvancedGridControls({
  columns,
  isGridEnabled,
  onColumnsChange,
  onGridEnabledChange,
  onGridHelpPress,
  onRowsChange,
  rows,
}: Props) {
  const { i18n, t } = useTranslation();
  const [activeAxis, setActiveAxis] = useState<"columns" | "rows">("columns");
  const isEnglish = i18n.resolvedLanguage === "en";
  const columnsLabel = isEnglish ? "Col" : t("advancedCalibration.columns");
  const rowsLabel = isEnglish ? "Row" : t("advancedCalibration.rows");
  const isColumnsActive = activeAxis === "columns";

  return (
    <View className="gap-2 rounded-2xl border border-white/10 bg-zinc-900/90 px-3 py-2.5">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-semibold uppercase tracking-[0.8px] text-zinc-400">
          {t("advancedCalibration.gridControlsTitle")}
        </Text>
        <View className="flex-row items-center gap-2">
          <GridHelpButton
            label={t("advancedCalibration.gridHelpButton")}
            onPress={onGridHelpPress}
            testID="advanced-grid-help"
          />
          <Switch
            accessibilityLabel={t("advancedCalibration.gridToggleLabel")}
            offLabel={t("advancedCalibration.gridToggleOff")}
            onLabel={t("advancedCalibration.gridToggleOn")}
            onValueChange={onGridEnabledChange}
            testID="advanced-grid-toggle"
            value={isGridEnabled}
          />
        </View>
      </View>
      <View className="flex-row gap-2">
        <AxisChip
          disabled={!isGridEnabled}
          isActive={isColumnsActive}
          label={columnsLabel}
          onPress={() => setActiveAxis("columns")}
          testID="advanced-grid-columns-chip"
          value={columns}
        />
        <AxisChip
          disabled={!isGridEnabled}
          isActive={!isColumnsActive}
          label={rowsLabel}
          onPress={() => setActiveAxis("rows")}
          testID="advanced-grid-rows-chip"
          value={rows}
        />
      </View>
      <GridSlider
        disabled={!isGridEnabled}
        onValueChange={isColumnsActive ? onColumnsChange : onRowsChange}
        value={isColumnsActive ? columns : rows}
      />
    </View>
  );
}

interface AxisChipProps {
  disabled: boolean;
  isActive: boolean;
  label: string;
  onPress: () => void;
  testID: string;
  value: number;
}

function AxisChip({ disabled, isActive, label, onPress, testID, value }: AxisChipProps) {
  return (
    <Pressable
      accessibilityState={{ disabled }}
      className={`flex-1 rounded-xl px-3 py-2 ${isActive ? "bg-white/10" : "bg-zinc-800/60"} ${disabled ? "opacity-50" : ""}`}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
    >
      <View className="flex-row items-center justify-between">
        <Text className={`text-[10px] font-semibold uppercase tracking-[0.8px] ${isActive ? "text-white" : "text-zinc-400"}`}>
          {label}
        </Text>
        <Text className={`text-sm font-semibold ${isActive ? "text-white" : "text-zinc-300"}`}>
          {value}
        </Text>
      </View>
    </Pressable>
  );
}

interface GridSliderProps {
  disabled: boolean;
  onValueChange: (value: number) => void;
  value: number;
}

function GridSlider({ disabled, onValueChange, value }: GridSliderProps) {
  return (
    <View className="rounded-xl bg-zinc-800/70 px-3 py-2">
      <Slider
        accessibilityState={{ disabled }}
        disabled={disabled}
        max={8}
        min={1}
        onValueChange={onValueChange}
        size="sm"
        step={1}
        testID="advanced-grid-slider"
        value={value}
      />
    </View>
  );
}
