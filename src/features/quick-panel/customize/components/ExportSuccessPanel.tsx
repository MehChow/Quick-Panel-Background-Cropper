import { Card } from "@/components/ani-ui/card";
import { Text } from "@/components/ani-ui/text";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import type { GeneratedExport } from "../../model/types";
import { getResultPanelLayout } from "../../result/result-panel-layout";

interface ExportSuccessPanelProps {
  availableHeight?: number;
  availableWidth?: number;
  exports: GeneratedExport[];
}

export function ExportSuccessPanel({
  availableHeight = 0,
  availableWidth = 0,
  exports,
}: ExportSuccessPanelProps) {
  const { t } = useTranslation();
  const panelLayout = getResultPanelLayout({
    availableHeight,
    availableWidth,
  });
  const isCompact = panelLayout.isCompact;

  return (
    <Card
      className="items-center self-center rounded-2xl border-emerald-400/30 bg-emerald-800/10"
      style={{ maxWidth: panelLayout.cardMaxWidth, width: "100%" }}
    >
      <Text
        className={
          isCompact
            ? "px-2 text-center text-xl font-bold text-white"
            : "px-2 text-center text-2xl font-bold text-white"
        }
      >
        {t("export.successTitle")}
      </Text>
      <Text
        className={
          isCompact
            ? "mt-2 px-3 text-center text-sm leading-5 text-emerald-100"
            : "mt-2 px-3 text-center text-sm leading-5 text-emerald-100"
        }
      >
        {t("export.successSubtitle")}
      </Text>

      <View
        className={isCompact ? "mt-6 w-full self-center px-3" : "mt-7 w-full self-center"}
        style={{ maxWidth: panelLayout.gridMaxWidth }}
      >
        <View
          className={
            isCompact
              ? "w-full flex-row flex-wrap justify-between gap-y-4"
              : "w-full flex-row flex-wrap justify-between gap-y-5"
          }
        >
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
              <Text
                className={
                  isCompact
                    ? "mt-2 text-center text-sm font-medium text-emerald-100"
                    : "mt-2 text-center text-sm font-medium text-emerald-100"
                }
              >
                {t(`panels.${item.id}`)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );
}
