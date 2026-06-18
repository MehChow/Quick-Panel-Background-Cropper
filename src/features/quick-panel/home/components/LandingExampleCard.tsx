import { Card } from "@/components/ani-ui/card";
import { Text } from "@/components/ani-ui/text";
import { images } from "@/data/images";
import { Image } from "expo-image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { LayoutChangeEvent } from "react-native";
import { View } from "react-native";

const previewAspectRatio = 9 / 19.5;
const cardPadding = 48;
const labelHeight = 24;
const labelGap = 12;
const frameCornerRadius = 34;
const frameMaxHeightRatio = 0.94;
const frameMaxWidthRatio = 0.9;

interface LandingExampleCardProps {
  maxHeight: number;
}

export function LandingExampleCard({ maxHeight }: LandingExampleCardProps) {
  const { t } = useTranslation();
  const [cardWidth, setCardWidth] = useState(0);
  const contentWidth = Math.max(0, cardWidth - cardPadding);
  const contentHeight = Math.max(
    0,
    maxHeight - cardPadding - labelHeight - labelGap,
  );
  const frameWidth = Math.min(
    contentWidth * frameMaxWidthRatio,
    contentHeight * previewAspectRatio * frameMaxHeightRatio,
  );
  const frameHeight = frameWidth / previewAspectRatio;

  const handleLayout = (event: LayoutChangeEvent) => {
    setCardWidth(event.nativeEvent.layout.width);
  };

  return (
    <Card
      className="w-full items-center rounded-2xl border-none bg-transparent px-6 py-6"
      onLayout={handleLayout}
      style={maxHeight ? { height: maxHeight } : undefined}
    >
      <Text className="text-center font-semibold text-orange-400">
        {t("landing.example")}
      </Text>

      <View className="flex-1 items-center justify-center self-stretch">
        <View
          className="relative overflow-hidden border border-white/10 bg-[#24161f]"
          style={{
            borderRadius: frameCornerRadius,
            height: frameHeight,
            width: frameWidth,
          }}
        >
          <Image
            source={images.exampleResult}
            style={{ height: "100%", width: "100%" }}
            contentFit="cover"
          />
        </View>
      </View>
    </Card>
  );
}
