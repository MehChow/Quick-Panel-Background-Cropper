import { Button } from "@/components/ani-ui/button";
import { ExportSuccessPanel } from "@/features/quick-panel/customize/components/ExportSuccessPanel";
import { GoodLockUnavailableDialog } from "@/features/quick-panel/customize/components/GoodLockUnavailableDialog";
import { useGoodLockLink } from "@/features/quick-panel/customize/useGoodLockLink";
import { QuickPanelScreenShell } from "@/features/quick-panel/shared/QuickPanelScreenShell";
import { useQuickPanelStore } from "@/features/quick-panel/store/quick-panel-store";
import { quickPanelSelectors } from "@/features/quick-panel/store/selectors";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";

export function ResultScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [contentSize, setContentSize] = useState({ height: 0, width: 0 });
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
        footer={
          <>
            <Button
              className="mb-3 mt-4 w-full bg-white"
              loading={isOpeningGoodLock}
              onPress={openGoodLockApp}
              textClassName="font-semibold text-black"
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
        }
        footerTestID="result-footer"
        header={null}
      >
        <View
          className="flex-1 justify-center"
          onLayout={(event) =>
            setContentSize({
              height: event.nativeEvent.layout.height,
              width: event.nativeEvent.layout.width,
            })
          }
        >
          <ExportSuccessPanel
            availableHeight={contentSize.height}
            availableWidth={contentSize.width}
            exports={exports}
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
