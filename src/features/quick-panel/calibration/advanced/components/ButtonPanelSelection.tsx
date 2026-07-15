import { Text } from "@/components/ani-ui/text";
import { Lucide } from "@react-native-vector-icons/lucide";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { getButtonDisplayLabel, searchButtonLabels } from "../../../model/button-labels";
import type { ButtonCalibrationItem, ButtonPanelId, PanelRect, PickedImage } from "../../../model/types";
import { CalibrationAreaPreview } from "./CalibrationAreaPreview";

interface Props {
  buttons: ButtonCalibrationItem[];
  outerRect: PanelRect;
  screenshot: PickedImage;
  onButtonsChange: (buttons: ButtonCalibrationItem[]) => void;
}

function createButtonItems(labels: string[], outerRect: PanelRect): ButtonCalibrationItem[] {
  return labels.map((label, index) => ({
    id: `button-${index + 1}` as ButtonPanelId,
    label,
    rect: getInitialButtonRect(index, labels.length, outerRect),
  }));
}

function getInitialButtonRect(index: number, count: number, outerRect: PanelRect): PanelRect {
  const columns = Math.min(2, count);
  const rows = Math.ceil(count / columns);
  const gap = 8;
  const column = index % columns;
  const row = Math.floor(index / columns);
  const width = (outerRect.width - gap * (columns + 1)) / columns;
  const height = (outerRect.height - gap * (rows + 1)) / rows;
  return {
    x: outerRect.x + gap + column * (width + gap),
    y: outerRect.y + gap + row * (height + gap),
    width,
    height,
    radius: 0,
  };
}

export function ButtonPanelSelection({
  buttons,
  outerRect,
  screenshot,
  onButtonsChange,
}: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const selectedLabels = buttons.map((button) => button.label);
  const translateLabel = (key: string) => t(key);
  const labels = searchButtonLabels(query, translateLabel).slice(0, 12);
  const setLabels = (nextLabels: string[]) => {
    onButtonsChange(createButtonItems(nextLabels, outerRect));
  };
  const addLabel = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed || selectedLabels.includes(trimmed)) return;
    setLabels([...selectedLabels, trimmed]);
    setQuery("");
  };
  const toggleLabel = (label: string) => {
    setLabels(
      selectedLabels.includes(label)
        ? selectedLabels.filter((item) => item !== label)
        : [...selectedLabels, label],
    );
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
                {selectedLabels.length ? selectedLabels.map((label) => (
                  <Pressable
                    key={label}
                    accessibilityLabel={`${t("advancedCalibration.remove")} ${getButtonDisplayLabel(label, translateLabel)}`}
                    accessibilityRole="button"
                    className="flex-row items-center gap-1.5 rounded-full border border-emerald-300/40 bg-emerald-300/10 px-3 py-1.5"
                    onPress={() => toggleLabel(label)}
                  >
                    <Text className="text-xs font-semibold text-emerald-100">{getButtonDisplayLabel(label, translateLabel)}</Text>
                    <Lucide color="#d1fae5" name="x" size={12} />
                  </Pressable>
                )) : (
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
                onPress={() => addLabel(query)}
              >
                <Text className="font-semibold text-white">
                  {t("advancedCalibration.addCustomButtonLabel", { label: query.trim() })}
                </Text>
              </Pressable>
            ) : null}
          </ScrollView>
        )}
      </CalibrationAreaPreview>
    </View>
  );
}
