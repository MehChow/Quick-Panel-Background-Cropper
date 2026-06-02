import { LandingScreen } from "@/features/quick-panel/home/LandingScreen";
import { AppHeader } from "@/features/quick-panel/shared/AppHeader";
import { useQuickPanelStore } from "@/features/quick-panel/store/store";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const isCalibrated = useQuickPanelStore((state) => state.isCalibrated);
  const goToCalibration = useQuickPanelStore((state) => state.goToCalibration);
  const startCustomizing = useQuickPanelStore(
    (state) => state.startCustomizing,
  );

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
      <View className="px-5 pt-6">
        <AppHeader />
      </View>

      <View className="flex-1 px-5 pb-8">
        <LandingScreen
          isCalibrated={isCalibrated}
          onCalibrate={openCalibration}
          onStart={openCustomize}
        />
      </View>
    </SafeAreaView>
  );
}
