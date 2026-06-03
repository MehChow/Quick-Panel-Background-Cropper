import { Text } from "@/components/ani-ui/text";
import { CalibrationHelpSheet } from "@/features/quick-panel/calibration/CalibrationHelpSheet";
import { CalibrationControls } from "@/features/quick-panel/calibration/CalibrationControls";
import { CalibrationScreen } from "@/features/quick-panel/calibration/CalibrationScreen";
import { useQuickPanelActions } from "@/features/quick-panel/hooks/useQuickPanelActions";
import type {
  ExportRefs,
  PanelRect,
  PickedImage,
} from "@/features/quick-panel/model/types";
import { AppGradientBackground } from "@/features/quick-panel/shared/AppGradientBackground";
import { SubPageHeader } from "@/features/quick-panel/shared/SubPageHeader";
import { useQuickPanelStore } from "@/features/quick-panel/store/store";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CalibrationPage() {
  const refs = useEmptyExportRefs();
  const router = useRouter();
  const { t } = useTranslation();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [leavingCalibration, setLeavingCalibration] =
    useState<CalibrationPresentation | null>(null);
  const screenshot = useQuickPanelStore((state) => state.screenshot);
  const calibrationRect = useQuickPanelStore((state) => state.calibrationRect);
  const error = useQuickPanelStore((state) => state.error);
  const setCalibrationRect = useQuickPanelStore(
    (state) => state.setCalibrationRect,
  );
  const acceptCalibration = useQuickPanelStore(
    (state) => state.acceptCalibration,
  );
  const { pickScreenshot } = useQuickPanelActions(refs);
  const displayedScreenshot = screenshot ?? leavingCalibration?.screenshot ?? null;
  const displayedRect = calibrationRect ?? leavingCalibration?.rect ?? null;
  const isCalibrating = Boolean(displayedScreenshot && displayedRect);

  const importScreenshot = async () => {
    setIsHelpOpen(false);
    await pickScreenshot();
  };

  const saveCalibration = () => {
    if (screenshot && calibrationRect) {
      setLeavingCalibration({ screenshot, rect: calibrationRect });
    }
    if (acceptCalibration()) {
      router.replace("/");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AppGradientBackground />
      <View className="px-5 pt-8">
        <SubPageHeader
          onHelpPress={() => setIsHelpOpen(true)}
          title={t("calibration.title")}
          subtitle={t("calibration.subtitle")}
        />
      </View>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        overScrollMode="never"
      >
        <CalibrationScreen
          screenshot={displayedScreenshot}
          rect={displayedRect}
          onImport={importScreenshot}
          onRectChange={setCalibrationRect}
          onContinue={saveCalibration}
          showControls={!isCalibrating}
        />
        {error ? (
          <Text className="mt-4 rounded-md bg-red-500/15 p-3 text-sm text-red-100">
            {error}
          </Text>
        ) : null}
      </ScrollView>
      {isCalibrating ? (
        <View className="border-t border-white/10 px-5">
          <CalibrationControls
            onContinue={saveCalibration}
            onImport={importScreenshot}
          />
        </View>
      ) : null}
      <CalibrationHelpSheet
        visible={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </SafeAreaView>
  );
}

interface CalibrationPresentation {
  screenshot: PickedImage;
  rect: PanelRect;
}

function useEmptyExportRefs(): ExportRefs {
  const buttonBoxRef = useRef<View>(null);
  const mediaPlayerRef = useRef<View>(null);
  const brightnessRef = useRef<View>(null);
  const volumeRef = useRef<View>(null);

  return {
    brightness: brightnessRef,
    buttonBox: buttonBoxRef,
    mediaPlayer: mediaPlayerRef,
    volume: volumeRef,
  };
}
