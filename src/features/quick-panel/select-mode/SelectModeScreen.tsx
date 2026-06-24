import { Button } from "@/components/ani-ui/button";
import { QuickPanelScreenShell } from "@/features/quick-panel/shared/QuickPanelScreenShell";
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
  const { lastExportedMode, selectMode } = useQuickPanelStore(
    useShallow(quickPanelSelectors.modeSelectionScreen),
  );
  const [selectedMode, setSelectedMode] = useState<CustomizationMode | null>(
    lastExportedMode,
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
      <QuickPanelScreenShell
        footer={
          <Button
            className="my-4 p-0 bg-white"
            disabled={!selectedMode}
            onPress={confirmMode}
            textClassName="font-semibold w-full text-black"
          >
            {t("common.confirm")}
          </Button>
        }
        footerTestID="select-mode-footer"
        header={
          <SubPageHeader
            actionVariant="helper-balanced"
            onActionPress={() => setIsHelpOpen(true)}
            title={t("mode.title")}
            subtitle={t("mode.subtitle")}
          />
        }
        >
        <View className="flex-1 justify-center py-2">
          <View className="flex-row items-start justify-center gap-4">
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
        </View>
      </QuickPanelScreenShell>
      {isHelpOpen ? (
        <ModeHelpSheet
          defaultDescription={t("mode.defaultDescription")}
          defaultLabel={t("mode.default")}
          onClose={() => setIsHelpOpen(false)}
          subtitle={t("mode.helpSubtitle")}
          title={t("mode.helpTitle")}
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

function ModeCard({
  isSelected,
  label,
  mode,
  onPress,
}: ModeCardProps) {
  return (
    <View className="basis-0 flex-1">
      <ModeOptionCard
        isSelected={isSelected}
        label={label}
        mode={mode}
        onPress={onPress}
      />
    </View>
  );
}
