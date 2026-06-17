import { Text } from "@/components/ani-ui/text";
import { Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { CustomizationMode } from "../../model/types";

interface ImagePickerCardProps {
  mode: CustomizationMode;
  onPick: () => void;
  onRecalibrate: () => void;
}

export function ImagePickerCard({ mode, onPick, onRecalibrate }: ImagePickerCardProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-3">
      <Pressable
        accessibilityRole="button"
        className="h-120 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 px-6 active:opacity-80"
        onPress={onPick}
      >
        <Text className="text-center text-lg font-semibold text-white">
          {t("customize.pickerTitle")}
        </Text>
        <Text className="mt-2 text-center text-sm leading-5 text-zinc-400">
          {t("customize.pickerSubtitle")}
        </Text>
      </Pressable>
      <Text className="text-center text-sm leading-5 text-zinc-400">
        {t(`customize.${mode}Calibrated`)}{" "}
        <Text
          accessibilityRole="link"
          className="text-sm leading-5 text-orange-200 underline"
          onPress={onRecalibrate}
        >
          {t("customize.recalibrate")}
        </Text>
      </Text>
    </View>
  );
}
