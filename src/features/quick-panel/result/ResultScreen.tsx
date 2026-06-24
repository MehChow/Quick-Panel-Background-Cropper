import { Button } from "@/components/ani-ui/button";
import { ExportSuccessPanel } from "@/features/quick-panel/customize/components/ExportSuccessPanel";
import { GoodLockUnavailableDialog } from "@/features/quick-panel/customize/components/GoodLockUnavailableDialog";
import { useGoodLockLink } from "@/features/quick-panel/customize/useGoodLockLink";
import { QuickPanelScreenShell } from "@/features/quick-panel/shared/QuickPanelScreenShell";
import { getWideScreenLayout } from "@/features/quick-panel/shared/wide-screen-layout";
import { useQuickPanelStore } from "@/features/quick-panel/store/quick-panel-store";
import { quickPanelSelectors } from "@/features/quick-panel/store/selectors";
import { Redirect, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";

export function ResultScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const layout = getWideScreenLayout(width, height);
  const { exports, goToLanding } = useQuickPanelStore(
    useShallow(quickPanelSelectors.resultScreen),
  );
  const {
    closeGoodLockDialog,
    isGoodLockDialogOpen,
    isOpeningGoodLock,
    isOpeningSamsungStore,
    openGoodLockApp,
    openSamsungStore,
  } = useGoodLockLink();

  if (exports.length === 0) {
    return <Redirect href="/" />;
  }

  const backHome = () => {
    goToLanding();
    router.dismissTo("/");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QuickPanelScreenShell
        contentMaxWidth={layout.heroMaxWidth}
        footer={(
          <>
            <Button
              className="mb-3 mt-4 w-full"
              loading={isOpeningGoodLock}
              onPress={openGoodLockApp}
              textClassName="font-semibold"
            >
              {isOpeningGoodLock
                ? t("export.openingGoodLock")
                : t("export.openGoodLock")}
            </Button>
            <Button
              className="mb-4 w-full bg-black"
              onPress={backHome}
              textClassName="font-semibold text-white"
            >
              {t("export.backHome")}
            </Button>
          </>
        )}
        footerMaxWidth={layout.footerMaxWidth}
        footerTestID="result-footer"
        header={null}
      >
        <View
          className={layout.isWideScreen ? "flex-1 items-center pt-4" : "flex-1 justify-center"}
        >
          <ExportSuccessPanel
            exports={exports}
            previewGridMaxWidth={layout.resultGridMaxWidth}
          />
        </View>
      </QuickPanelScreenShell>
      <GoodLockUnavailableDialog
        isOpeningSamsungStore={isOpeningSamsungStore}
        onClose={closeGoodLockDialog}
        onOpenSamsungStore={openSamsungStore}
        open={isGoodLockDialogOpen}
      />
    </SafeAreaView>
  );
}
