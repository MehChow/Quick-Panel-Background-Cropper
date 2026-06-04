import { Button } from "@/components/ani-ui/button";
import { Text } from "@/components/ani-ui/text";
import { AppHeader } from "@/features/quick-panel/shared/AppHeader";
import { useQuickPanelStore } from "@/features/quick-panel/store/quick-panel-store";
import { quickPanelSelectors } from "@/features/quick-panel/store/selectors";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";
import { LandingExampleCard } from "./components/LandingExampleCard";
import { useLandingLayout } from "./hooks/useLandingLayout";

export function LandingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isCalibrated, goToCalibration, startCustomizing } =
    useQuickPanelStore(useShallow(quickPanelSelectors.landingScreen));
  const { cardHeight, handleContainerLayout, handleActionsLayout } =
    useLandingLayout();

  const openCalibration = () => {
    goToCalibration();
    router.push("/calibration");
  };

  const openCustomize = () => {
    if (startCustomizing()) {
      router.push("/customize");
      return;
    }
    router.push("/calibration");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="px-5 pt-6">
        <AppHeader />
      </View>
      <View className="flex-1 px-5 pb-8">
        <View className="flex-1 pt-4" onLayout={handleContainerLayout}>
          <LandingExampleCard maxHeight={cardHeight} />

          <View className="mt-4 gap-2" onLayout={handleActionsLayout}>
            <Button
              className="w-full"
              onPress={openCustomize}
              disabled={!isCalibrated}
              textClassName="font-semibold"
            >
              {t("landing.startCustomizing")}
            </Button>
            {isCalibrated ? (
              <Text className="text-center text-sm leading-5 text-zinc-400">
                {t("landing.calibrated")}{" "}
                <Text
                  accessibilityRole="link"
                  className="text-sm leading-5 text-orange-200 underline"
                  onPress={openCalibration}
                >
                  {t("landing.recalibrate")}
                </Text>
              </Text>
            ) : (
              <Button
                className="w-full bg-orange-100"
                onPress={openCalibration}
                textClassName="font-semibold text-orange-800"
              >
                {t("landing.calibration")}
              </Button>
            )}
            {!isCalibrated ? (
              <Text className="text-center text-xs text-zinc-400">
                {t("landing.calibrationRequired")}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
