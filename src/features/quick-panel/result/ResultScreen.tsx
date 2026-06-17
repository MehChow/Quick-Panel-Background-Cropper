import { ExportSuccessPanel } from "@/features/quick-panel/customize/components/ExportSuccessPanel";
import { useQuickPanelStore } from "@/features/quick-panel/store/quick-panel-store";
import { quickPanelSelectors } from "@/features/quick-panel/store/selectors";
import { Redirect, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";

export function ResultScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { exports, goToLanding } = useQuickPanelStore(
    useShallow(quickPanelSelectors.resultScreen),
  );

  if (exports.length === 0) {
    return <Redirect href="/" />;
  }

  const backHome = () => {
    goToLanding();
    router.dismissTo("/");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 px-5 pb-8">
        <View className="flex-1 justify-center">
          <ExportSuccessPanel
            exports={exports}
            onSecondaryAction={backHome}
            secondaryActionLabel={t("export.backHome")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
