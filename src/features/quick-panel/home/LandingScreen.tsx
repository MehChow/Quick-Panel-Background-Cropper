import { Button } from "@/components/ani-ui/button";
import { AppHeader } from "@/features/quick-panel/shared/AppHeader";
import BuildVersion from "@/features/quick-panel/shared/BuildVersion";
import { shouldShowBuildVersion } from "@/features/quick-panel/shared/buildFlags";
import { QuickPanelScreenShell } from "@/features/quick-panel/shared/QuickPanelScreenShell";
import { useQuickPanelStore } from "@/features/quick-panel/store/quick-panel-store";
import { quickPanelSelectors } from "@/features/quick-panel/store/selectors";
import { type Href, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";
import { LandingExampleCard } from "./components/LandingExampleCard";
import { useLandingLayout } from "./hooks/useLandingLayout";

export function LandingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const shouldShowVersion = !__DEV__ && shouldShowBuildVersion;
  const { goToModeSelection } = useQuickPanelStore(
    useShallow(quickPanelSelectors.landingScreen),
  );
  const { cardHeight, handleContainerLayout, handleActionsLayout } =
    useLandingLayout();

  const openCustomize = () => {
    goToModeSelection();
    router.push("/select-mode" as Href);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QuickPanelScreenShell
        bodyClassName="pb-8"
        header={<AppHeader />}
      >
        <View className="flex-1 pt-4" onLayout={handleContainerLayout}>
          <LandingExampleCard maxHeight={cardHeight} />

          <View className="mt-4" onLayout={handleActionsLayout}>
            {shouldShowVersion && <BuildVersion />}
            <Button
              className="w-full bg-white"
              onPress={openCustomize}
              textClassName="font-semibold text-black"
            >
              {t("landing.startCustomizing")}
            </Button>
          </View>
        </View>
      </QuickPanelScreenShell>
    </SafeAreaView>
  );
}
