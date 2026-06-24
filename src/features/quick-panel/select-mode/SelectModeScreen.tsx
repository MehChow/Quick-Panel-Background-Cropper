import { Button } from "@/components/ani-ui/button";
import { cn } from "@/lib/utils";
import { QuickPanelScreenShell } from "@/features/quick-panel/shared/QuickPanelScreenShell";
import { SubPageHeader } from "@/features/quick-panel/shared/SubPageHeader";
import { getWideScreenLayout } from "@/features/quick-panel/shared/wide-screen-layout";
import { useQuickPanelStore } from "@/features/quick-panel/store/quick-panel-store";
import { quickPanelSelectors } from "@/features/quick-panel/store/selectors";
import { type Href, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";
import type { CustomizationMode } from "../model/types";
import { ModeHelpSheet } from "./ModeHelpSheet";
import { ModeOptionCard } from "./ModeOptionCard";

export function SelectModeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { lastExportedMode, selectMode } = useQuickPanelStore(
    useShallow(quickPanelSelectors.modeSelectionScreen),
  );
  const [selectedMode, setSelectedMode] = useState<CustomizationMode | null>(
    lastExportedMode,
  );
  const layout = getWideScreenLayout(width, height);

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
        contentMaxWidth={layout.selectContentMaxWidth}
        footer={(
          <Button
            className="my-4 p-0"
            disabled={!selectedMode}
            onPress={confirmMode}
            textClassName="font-semibold w-full"
          >
            {t("common.confirm")}
          </Button>
        )}
        footerMaxWidth={layout.footerMaxWidth}
        footerTestID="select-mode-footer"
        header={(
          <SubPageHeader
            actionVariant="helper-balanced"
            onActionPress={() => setIsHelpOpen(true)}
            title={t("mode.title")}
            subtitle={t("mode.subtitle")}
          />
        )}
      >
        <View className="flex-1 justify-center">
          <View
            className={cn(
              "items-center gap-4",
              layout.shouldStackSelectCards
                ? "justify-center"
                : "flex-row items-start justify-center",
            )}
          >
            <ModeCard
              cardMaxWidth={layout.selectCardMaxWidth}
              isSelected={selectedMode === "default"}
              isStacked={layout.shouldStackSelectCards}
              label={t("mode.default")}
              mode="default"
              onPress={() => setSelectedMode("default")}
              previewMaxHeight={layout.selectPreviewMaxHeight}
            />
            <ModeCard
              cardMaxWidth={layout.selectCardMaxWidth}
              isSelected={selectedMode === "advanced"}
              isStacked={layout.shouldStackSelectCards}
              label={t("mode.advanced")}
              mode="advanced"
              onPress={() => setSelectedMode("advanced")}
              previewMaxHeight={layout.selectPreviewMaxHeight}
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
  cardMaxWidth: number;
  isSelected: boolean;
  isStacked: boolean;
  label: string;
  mode: CustomizationMode;
  onPress: () => void;
  previewMaxHeight: number;
}

function ModeCard({
  cardMaxWidth,
  isSelected,
  isStacked,
  label,
  mode,
  onPress,
  previewMaxHeight,
}: ModeCardProps) {
  return (
    <ModeOptionCard
      cardMaxWidth={cardMaxWidth}
      isSelected={isSelected}
      isStacked={isStacked}
      label={label}
      mode={mode}
      onPress={onPress}
      previewMaxHeight={previewMaxHeight}
    />
  );
}
