import { Text } from "@/components/ani-ui/text";
import { Lucide } from "@react-native-vector-icons/lucide";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { createButtonItems } from "../button-selection";
import {
  getButtonDisplayLabel,
  getButtonIconName,
  searchButtonLabels,
} from "../../../model/button-labels";
import type { ButtonCalibrationItem, PanelRect, PickedImage } from "../../../model/types";
import { CalibrationAreaPreview } from "./CalibrationAreaPreview";
import { CustomButtonIconDialog } from "./CustomButtonIconDialog";

interface Props {
  buttons: ButtonCalibrationItem[];
  outerRect: PanelRect;
  screenshot: PickedImage;
  onButtonsChange: (buttons: ButtonCalibrationItem[]) => void;
}

export function ButtonPanelSelection({
  buttons,
  outerRect,
  screenshot,
  onButtonsChange,
}: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [pendingCustomLabel, setPendingCustomLabel] = useState<string | null>(null);
  const selectedLabels = buttons.map((button) => button.label);
  const translateLabel = (key: string) => t(key);
  const labels = searchButtonLabels(query, translateLabel).slice(0, 12);
  const setChoices = (nextButtons: Pick<ButtonCalibrationItem, "customIconId" | "label">[]) => {
    onButtonsChange(createButtonItems(nextButtons, outerRect));
  };
  const toggleLabel = (label: string) => {
    setChoices(
      selectedLabels.includes(label)
        ? buttons.filter((item) => item.label !== label)
        : [...buttons, { label, customIconId: null }],
    );
    setQuery("");
  };
  const selectCustomIcon = (customIconId: ButtonCalibrationItem["customIconId"]) => {
    if (!pendingCustomLabel || !customIconId) return;
    setChoices([...buttons, { label: pendingCustomLabel, customIconId }]);
    setPendingCustomLabel(null);
    setQuery("");
  };
  const canAddCustomLabel = Boolean(query.trim()) && !selectedLabels.includes(query.trim());

  return (
    <View className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80">
      <CalibrationAreaPreview outerRect={outerRect} screenshot={screenshot}>
        {(previewTrigger) => (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="gap-3 p-4 pb-6"
          >
            <View className="flex-row gap-3">
              <TextInput
                className="min-h-12 flex-1 rounded-xl border border-white/10 bg-zinc-950 px-4 text-white"
                placeholder={t("advancedCalibration.buttonSearchPlaceholder")}
                placeholderTextColor="#71717a"
                value={query}
                onChangeText={setQuery}
              />
              {previewTrigger}
            </View>
            <View className="gap-2 rounded-xl border border-white/10 bg-zinc-950/70 p-3">
              <Text className="text-sm font-semibold text-white">
                {t("advancedCalibration.selectedButtons", { count: selectedLabels.length })}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {selectedLabels.length
                  ? buttons.map((button) => {
                      const isCustom = Boolean(button.customIconId);
                      const displayLabel = getButtonDisplayLabel(
                        button.label,
                        translateLabel,
                      );
                      return (
                        <Pressable
                          key={button.label}
                          accessibilityLabel={`${t("advancedCalibration.remove")} ${displayLabel}`}
                          accessibilityRole="button"
                          className={`flex-row items-center gap-1.5 rounded-full border px-3 py-1.5 ${
                            isCustom
                              ? "border-amber-300/50 bg-amber-300/10"
                              : "border-emerald-300/40 bg-emerald-300/10"
                          }`}
                          onPress={() => toggleLabel(button.label)}
                        >
                          {isCustom ? (
                            <Lucide
                              color="#fde68a"
                              name={getButtonIconName(
                                button.label,
                                button.customIconId,
                              )}
                              size={13}
                            />
                          ) : null}
                          <Text
                            className={`text-xs font-semibold ${
                              isCustom ? "text-amber-100" : "text-emerald-100"
                            }`}
                          >
                            {displayLabel}
                          </Text>
                          <Lucide
                            color={isCustom ? "#fef3c7" : "#d1fae5"}
                            name="x"
                            size={12}
                          />
                        </Pressable>
                      );
                    })
                  : (
                  <Text className="text-sm text-zinc-500">
                    {t("advancedCalibration.noButtonsSelected")}
                  </Text>
                    )}
              </View>
            </View>
            <View className="gap-2">
              {labels.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selectedLabels.includes(item.label) }}
                  className={`min-h-11 justify-center rounded-xl border px-3 ${
                    selectedLabels.includes(item.label)
                      ? "border-emerald-300/40 bg-emerald-300/10"
                      : "border-white/10 bg-zinc-800/70"
                  }`}
                  onPress={() => toggleLabel(item.label)}
                >
                  <Text className="font-semibold text-white">{getButtonDisplayLabel(item.label, translateLabel)}</Text>
                </Pressable>
              ))}
            </View>
            {canAddCustomLabel ? (
              <Pressable
                className="min-h-11 justify-center rounded-xl border border-dashed border-white/20 bg-zinc-950 px-3"
                onPress={() => setPendingCustomLabel(query.trim())}
              >
                <Text className="font-semibold text-white">
                  {t("advancedCalibration.addCustomButtonLabel", { label: query.trim() })}
                </Text>
              </Pressable>
            ) : null}
          </ScrollView>
        )}
      </CalibrationAreaPreview>
      <CustomButtonIconDialog
        label={pendingCustomLabel ?? ""}
        onClose={() => setPendingCustomLabel(null)}
        onSelect={selectCustomIcon}
        open={pendingCustomLabel !== null}
      />
    </View>
  );
}
