import { Button } from "@/components/ani-ui/button";
import { Text } from "@/components/ani-ui/text";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import type { GeneratedExport } from "../types";

interface ExportSuccessPanelProps {
  exports: GeneratedExport[];
  onConvertAnother: () => void;
}

export function ExportSuccessPanel({
  exports,
  onConvertAnother,
}: ExportSuccessPanelProps) {
  const { t } = useTranslation();

  return (
    <View className="mb-4 items-center rounded-[30px] border border-emerald-400/30 bg-emerald-400/10 px-5 py-8">
      <Text className="text-center text-2xl font-bold text-white">
        {t("export.successTitle")}
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-emerald-100">
        {t("export.successSubtitle")}
      </Text>

      <View className="mt-7 w-full flex-row flex-wrap justify-between gap-y-5">
        {exports.map((item) => (
          <View key={item.id} className="w-[47%] items-center">
            <View className="aspect-square w-full overflow-hidden rounded-2xl border border-emerald-300/40 bg-sky-200">
              <Image
                key={`${item.id}-${item.previewUri}`}
                cachePolicy="none"
                source={{ uri: item.previewUri }}
                contentFit="cover"
                style={{ height: "100%", width: "100%" }}
              />
            </View>
            <Text className="mt-2 text-center text-sm font-medium text-emerald-100">
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      <Button className="mt-8 w-full" onPress={onConvertAnother}>
        {t("export.convertAnother")}
      </Button>
    </View>
  );
}
