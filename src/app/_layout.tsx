import { ReleaseAnnouncementHost } from "@/features/quick-panel/release/ReleaseAnnouncementHost";
import { AppGradientBackground } from "@/features/quick-panel/shared/AppGradientBackground";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../global.css";
import "../../i18next/i18next";
import { runColdStartCacheMaintenance } from "@/features/quick-panel/cache/cache-maintenance";

SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

export default function RootLayout() {
  useEffect(() => {
    void runColdStartCacheMaintenance();
  }, []);

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <View style={{ flex: 1 }}>
            <AppGradientBackground />
            <Stack
              screenOptions={{
                animation: "slide_from_right",
                contentStyle: { backgroundColor: "transparent" },
                headerShown: false,
              }}
            />
          </View>
          <ReleaseAnnouncementHost />
          {/* {__DEV__ ? <FloatingLanguageSwitchButton /> : null} */}
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
