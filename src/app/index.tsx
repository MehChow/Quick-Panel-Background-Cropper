import { AppHeader } from "@/features/quick-panel/components/AppHeader";
import { CompatibilityNotice } from "@/features/quick-panel/components/CompatibilityNotice";
import { LandingScreen } from "@/features/quick-panel/components/LandingScreen";
import { useQuickPanelStore } from "@/features/quick-panel/store";
import { useRouter } from "expo-router";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const isCalibrated = useQuickPanelStore((state) => state.isCalibrated);
  const goToCalibration = useQuickPanelStore((state) => state.goToCalibration);
  const startCustomizing = useQuickPanelStore((state) => state.startCustomizing);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#09090b" }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 py-8"
        overScrollMode="never"
      >
        <AppHeader />
        <LandingScreen
          isCalibrated={isCalibrated}
          onCalibrate={openCalibration}
          onStart={openCustomize}
        />
        <CompatibilityNotice />
      </ScrollView>
    </SafeAreaView>
  );
}
