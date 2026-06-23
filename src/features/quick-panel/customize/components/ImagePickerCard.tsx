import { Button } from "@/components/ani-ui/button";
import { Text } from "@/components/ani-ui/text";
import { images } from "@/data/images";
import { Image } from "expo-image";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import type { CustomizationMode } from "../../model/types";

interface ImagePickerCardProps {
  mode: CustomizationMode;
  isProcessing: boolean;
  onPick: () => void;
  onRecalibrate: () => void;
}

export function ImagePickerCard({
  mode,
  isProcessing,
  onPick,
  onRecalibrate,
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
            {t("landing.example")}
          </Text>
          <View className="mt-4 h-64 w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
            <Image
              contentFit="cover"
              source={images.exampleSrc}
              style={{ height: "100%", width: "100%" }}
            />
          </View>
          <Button
            className="mt-6 w-full bg-white"
            disabled={isProcessing}
            loading={isProcessing}
            onPress={onPick}
            textClassName="font-semibold text-zinc-900"
          >
            {isProcessing
              ? t("customize.optimizingImage")
              : t("calibration.chooseFromAlbum")}
          </Button>
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
