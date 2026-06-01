import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { FloatingLanguageSwitchButton } from "@/features/quick-panel/components/LanguageSwitchButton";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../global.css";
import "../../i18next/i18next";

export default function RootLayout() {
  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <Stack screenOptions={{ headerShown: false }} />
          <FloatingLanguageSwitchButton />
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
