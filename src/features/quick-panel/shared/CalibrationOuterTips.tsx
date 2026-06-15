import { Text } from "@/components/ani-ui/text";
import { images } from "@/data/images";
import Lucide from "@react-native-vector-icons/lucide";
import { Image } from "expo-image";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface TipCardProps {
  description: ReactNode;
  icon: "check" | "x";
  iconColor: string;
  source: number;
}

export function CalibrationOuterTips() {
  const { t } = useTranslation();

  return (
    <View className="gap-4">
      <Text className="text-center font-semibold text-orange-400">
        {t("calibration.bestResultTitle")}
      </Text>

      <View className="flex-row gap-6 mt-4">
        <TipCard
          description={
            <HighlightedDescription
              description={t("calibration.bestResultGood")}
              greenBoxLabel={t("calibration.greenBoxLabel")}
              layoutBoundaryLabel={t("calibration.layoutBoundaryLabel")}
            />
          }
          icon="check"
          iconColor="#16a34a"
          source={images.calibrateGood}
        />
        <TipCard
          description={
            <HighlightedDescription
              description={t("calibration.bestResultBad")}
              greenBoxLabel={t("calibration.greenBoxLabel")}
              layoutBoundaryLabel={t("calibration.layoutBoundaryLabel")}
            />
          }
          icon="x"
          iconColor="#dc2626"
          source={images.calibrateBad}
        />
      </View>
    </View>
  );
}

interface HighlightedDescriptionProps {
  description: string;
  greenBoxLabel: string;
  layoutBoundaryLabel: string;
}

function HighlightedDescription({
  description,
  greenBoxLabel,
  layoutBoundaryLabel,
}: HighlightedDescriptionProps) {
  const greenSegments = description.split(greenBoxLabel);

  return greenSegments.map((segment, index) => (
    <Text
      key={`${greenBoxLabel}-${layoutBoundaryLabel}-${index}`}
      className="text-center text-sm font-medium text-zinc-200"
    >
      <HighlightedBoundaryText
        layoutBoundaryLabel={layoutBoundaryLabel}
        segment={segment}
      />
      {index < greenSegments.length - 1 ? (
        <Text className="text-sm font-semibold text-green-400">
          {greenBoxLabel}
        </Text>
      ) : null}
    </Text>
  ));
}

interface HighlightedBoundaryTextProps {
  layoutBoundaryLabel: string;
  segment: string;
}

function HighlightedBoundaryText({
  layoutBoundaryLabel,
  segment,
}: HighlightedBoundaryTextProps) {
  const boundarySegments = segment.split(layoutBoundaryLabel);

  return boundarySegments.map((part, index) => (
    <Text
      key={`${layoutBoundaryLabel}-${index}`}
      className="text-center text-sm font-medium text-zinc-200"
    >
      {part}
      {index < boundarySegments.length - 1 ? (
        <Text className="text-sm font-semibold text-red-400">
          {layoutBoundaryLabel}
        </Text>
      ) : null}
    </Text>
  ));
}

function TipCard({ description, icon, iconColor, source }: TipCardProps) {
  return (
    <View className="flex-col items-center gap-4 flex-1">
      <Lucide color={iconColor} name={icon} size={28} />

      <View
        className="w-32 overflow-hidden rounded-2xl border border-white/90"
        style={{ aspectRatio: 1 }}
      >
        <Image
          contentFit="cover"
          source={source}
          style={{ height: "100%", width: "100%" }}
        />
      </View>

      <Text className="text-sm font-medium text-center text-zinc-200">
        {description}
      </Text>
    </View>
  );
}
