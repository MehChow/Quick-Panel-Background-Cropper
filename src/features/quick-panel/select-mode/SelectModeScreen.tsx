import { Button } from "@/components/ani-ui/button";
import { SubPageHeader } from "@/features/quick-panel/shared/SubPageHeader";
import { useQuickPanelStore } from "@/features/quick-panel/store/quick-panel-store";
import { quickPanelSelectors } from "@/features/quick-panel/store/selectors";
import { type Href, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";
import type { CustomizationMode } from "../model/types";
import { ModeHelpSheet } from "./ModeHelpSheet";
import { ModeOptionCard } from "./ModeOptionCard";

export function SelectModeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<CustomizationMode | null>(
    null,
  );
  const { selectMode } = useQuickPanelStore(
    useShallow(quickPanelSelectors.modeSelectionScreen),
  );

  const confirmMode = () => {
    if (!selectedMode) {
      return;
    }

    const mode = selectedMode;
    const hasCalibration = selectMode(mode);
    if (hasCalibration) {
      router.push("/customize");
      return;
    }
    router.push(
      (mode === "default" ? "/calibration" : "/advanced-calibration") as Href,
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="px-5 pb-6 pt-8">
        <SubPageHeader
          onHelpPress={() => setIsHelpOpen(true)}
          title={t("mode.title")}
          subtitle={t("mode.subtitle")}
        />
      </View>
      <View className="flex-1 justify-center px-5">
        <View className="flex-row items-start gap-4">
          <ModeCard
            isSelected={selectedMode === "default"}
            label={t("mode.default")}
            mode="default"
            onPress={() => setSelectedMode("default")}
          />
          <ModeCard
            isSelected={selectedMode === "advanced"}
            label={t("mode.advanced")}
            mode="advanced"
            onPress={() => setSelectedMode("advanced")}
          />
        </View>
        <Button
          className="mt-10 p-0"
          disabled={!selectedMode}
          onPress={confirmMode}
          // Somehow it needs w-full on text to make the whole button pressable
          textClassName="font-semibold w-full"
        >
          {t("common.confirm")}
        </Button>
      </View>
      {isHelpOpen ? (
        <ModeHelpSheet
          defaultDescription={t("mode.defaultDescription")}
          defaultLabel={t("mode.default")}
          onClose={() => setIsHelpOpen(false)}
          subtitle={t("mode.subtitle")}
          title={t("mode.title")}
          advancedDescription={t("mode.advancedDescription")}
          advancedLabel={t("mode.advanced")}
        />
      ) : null}
    </SafeAreaView>
  );
}

interface ModeCardProps {
  isSelected: boolean;
  label: string;
  mode: CustomizationMode;
  onPress: () => void;
}

function ModeCard({ isSelected, label, mode, onPress }: ModeCardProps) {
  return (
    <ModeOptionCard
      isSelected={isSelected}
      label={label}
      mode={mode}
      onPress={onPress}
    />
  );
}
