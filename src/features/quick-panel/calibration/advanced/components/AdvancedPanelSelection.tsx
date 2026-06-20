import { Text } from "@/components/ani-ui/text";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { advancedPanelPhases } from "../advanced-steps";
import type { PanelId } from "../../../model/types";

interface Props {
  enabledPanels: PanelId[];
  onEnabledPanelsChange: (enabledPanels: PanelId[]) => void;
}

export function AdvancedPanelSelection({
  enabledPanels,
  onEnabledPanelsChange,
}: Props) {
  const { t } = useTranslation();

  const togglePanel = (panelId: PanelId) => {
    const isEnabled = enabledPanels.includes(panelId);
    const nextPanels = isEnabled
      ? enabledPanels.filter((id) => id !== panelId)
      : advancedPanelPhases.filter((id) =>
          id === panelId || enabledPanels.includes(id),
        );
    onEnabledPanelsChange(nextPanels);
  };

  return (
    <View className="gap-3 rounded-2xl border border-white/10 bg-zinc-900/80 p-4">
      <View className="gap-1">
        <Text className="text-base font-semibold text-white">
          {t("advancedCalibration.panelSelectionTitle")}
        </Text>
        <Text className="text-sm leading-5 text-zinc-400">
          {t("advancedCalibration.panelSelectionBody")}
        </Text>
      </View>
      <View className="gap-2">
        {advancedPanelPhases.map((panelId) => {
          const isEnabled = enabledPanels.includes(panelId);
          return (
            <Pressable
              key={panelId}
              accessibilityRole="switch"
              accessibilityState={{ checked: isEnabled }}
              className={`flex-row items-center justify-between rounded-xl border px-3 py-3 ${
                isEnabled
                  ? "border-emerald-300/40 bg-emerald-300/10"
                  : "border-white/10 bg-zinc-800/70"
              }`}
              onPress={() => togglePanel(panelId)}
            >
              <Text className="font-semibold text-white">
                {t(`panels.${panelId}`)}
              </Text>
              <Text
                className={`text-xs font-semibold uppercase ${
                  isEnabled ? "text-emerald-200" : "text-zinc-500"
                }`}
              >
                {isEnabled
                  ? t("advancedCalibration.panelEnabled")
                  : t("advancedCalibration.panelDisabled")}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
