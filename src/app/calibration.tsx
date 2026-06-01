import { Text } from "@/components/ani-ui/text";
import { CalibrationScreen } from "@/features/quick-panel/components/CalibrationScreen";
import { SubPageHeader } from "@/features/quick-panel/components/SubPageHeader";
import { useQuickPanelStore } from "@/features/quick-panel/store";
import type { ExportRefs } from "@/features/quick-panel/types";
import { useQuickPanelActions } from "@/features/quick-panel/useQuickPanelActions";
import { useRouter } from "expo-router";
import { useRef } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CalibrationPage() {
  const refs = useEmptyExportRefs();
  const router = useRouter();
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

  const saveCalibration = () => {
    if (acceptCalibration()) {
      router.replace("/");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#09090b" }}>
      <View className="px-5 pt-8">
        <SubPageHeader
          title="Calibration"
          subtitle="To match your device's Quick Panel layout"
        />
      </View>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        overScrollMode="never"
      >
        <CalibrationScreen
          screenshot={screenshot}
          rect={calibrationRect}
          onImport={pickScreenshot}
          onRectChange={setCalibrationRect}
          onContinue={saveCalibration}
        />
        {error ? (
          <Text className="mt-4 rounded-md bg-red-500/15 p-3 text-sm text-red-100">
            {error}
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
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
