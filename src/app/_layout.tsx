import { AppGradientBackground } from "@/features/quick-panel/shared/AppGradientBackground";
import BuildVersion from "@/features/quick-panel/shared/BuildVersion";
import { FloatingLanguageSwitchButton } from "@/features/quick-panel/shared/LanguageSwitchButton";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../global.css";
import "../../i18next/i18next";

SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

export default function RootLayout() {
  const isApkBuild = process.env.EXPO_PUBLIC_BUILD_TYPE === "apk";

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
            {/* 🚀 Encapsulated Global Overlay Layer */}
            {isApkBuild && <BuildVersion />}
          </View>
          {__DEV__ ? <FloatingLanguageSwitchButton /> : null}
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
