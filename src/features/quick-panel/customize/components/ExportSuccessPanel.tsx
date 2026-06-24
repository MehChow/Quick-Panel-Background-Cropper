import { Card } from "@/components/ani-ui/card";
import { Text } from "@/components/ani-ui/text";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import type { GeneratedExport } from "../../model/types";

interface ExportSuccessPanelProps {
  exports: GeneratedExport[];
  previewGridMaxWidth?: number;
}

export function ExportSuccessPanel({
  exports,
  previewGridMaxWidth,
}: ExportSuccessPanelProps) {
  const { t } = useTranslation();

  return (
    <Card className="items-center rounded-2xl border-emerald-400/30 bg-emerald-800/10">
      <Text className="text-center text-2xl font-bold text-white">
        {t("export.successTitle")}
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-emerald-100">
        {t("export.successSubtitle")}
      </Text>

      <View
        className="mt-7 w-full self-center"
        style={previewGridMaxWidth ? { maxWidth: previewGridMaxWidth } : undefined}
      >
        <View className="w-full flex-row flex-wrap justify-between gap-y-5">
          {exports.map((item) => (
            <View key={item.id} className="w-[47%] items-center">
              <View className="aspect-square w-full overflow-hidden rounded-2xl border border-emerald-300/40">
                <Image
                  key={`${item.id}-${item.previewUri}`}
                  cachePolicy="none"
                  source={{ uri: item.previewUri }}
                  contentFit="cover"
                  style={{ height: "100%", width: "100%" }}
                />
              </View>
              <Text className="mt-2 text-center text-sm font-medium text-emerald-100">
                {t(`panels.${item.id}`)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );
}
