import { Text } from "@/components/ani-ui/text";
import { SubPageHeader } from "@/features/quick-panel/shared/SubPageHeader";
import { useQuickPanelStore } from "@/features/quick-panel/store/quick-panel-store";
import { quickPanelSelectors } from "@/features/quick-panel/store/selectors";
import { Image } from "expo-image";
import { type Href, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";
import type { CustomizationMode } from "../model/types";

export function SelectModeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectMode } = useQuickPanelStore(
    useShallow(quickPanelSelectors.modeSelectionScreen),
  );

  const chooseMode = (mode: CustomizationMode) => {
    const hasCalibration = selectMode(mode);
    if (hasCalibration) {
      router.push("/customize");
      return;
    }
    router.push((mode === "default" ? "/calibration" : "/advanced-calibration") as Href);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="px-5 pt-8">
        <SubPageHeader
          title={t("mode.title")}
          subtitle={t("mode.subtitle")}
        />
      </View>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-5 pb-8"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        overScrollMode="never"
      >
        <ModeCard
          description={t("mode.defaultDescription")}
          image={require("@/assets/correct.jpeg")}
          label={t("mode.default")}
          onPress={() => chooseMode("default")}
        />
        <ModeCard
          description={t("mode.advancedDescription")}
          image={require("@/assets/incorrect.jpeg")}
          label={t("mode.advanced")}
          onPress={() => chooseMode("advanced")}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

interface ModeCardProps {
  description: string;
  image: number;
  label: string;
  onPress: () => void;
}

function ModeCard({ description, image, label, onPress }: ModeCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 active:opacity-80"
      onPress={onPress}
    >
      <Image source={image} contentFit="cover" className="h-52 w-full" />
      <View className="gap-1 p-4">
        <Text className="text-lg font-semibold text-white">{label}</Text>
        <Text className="text-sm leading-5 text-zinc-400">{description}</Text>
      </View>
    </Pressable>
  );
}
