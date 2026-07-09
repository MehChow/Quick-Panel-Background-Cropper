import { Text } from "@/components/ani-ui/text";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import type { CustomizationMode, QuickPanelPreset } from "../../model/types";
import { BackgroundLayoutPreview } from "./BackgroundLayoutPreview";

interface ImagePickerCardProps {
  mode: CustomizationMode;
  onRecalibrate: () => void;
  preset: QuickPanelPreset;
}

export function ImagePickerCard({
  mode,
  onRecalibrate,
  preset,
}: ImagePickerCardProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-3">
      <View className="rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-8">
        <View className="items-center">
          <Text className="text-center text-lg font-semibold text-white">
            {t("customize.pickerTitle")}
          </Text>
          <Text className="mt-2 text-center text-sm leading-5 text-zinc-400">
            {t("customize.pickerSubtitle")}
          </Text>
          <Text className="mt-4 text-center font-semibold text-orange-400">
            {t("customize.layoutPreview")}
          </Text>
          <BackgroundLayoutPreview preset={preset} />
        </View>
      </View>
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
