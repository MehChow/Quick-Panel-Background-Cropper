import { Card } from "@/components/ani-ui/card";
import { Text } from "@/components/ani-ui/text";
import { Image } from "expo-image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { LayoutChangeEvent } from "react-native";
import { View } from "react-native";

const exampleImageAspectRatio = 9 / 19.5;
const cardPadding = 48;
const cardContentGap = 20;
const exampleLabelHeight = 24;
const exampleLabelGap = 4;
const doroColumnWidth = 96;
const doroImageSize = 88;

interface LandingExampleCardProps {
  maxHeight: number;
}

export function LandingExampleCard({ maxHeight }: LandingExampleCardProps) {
  const { t } = useTranslation();
  const [cardWidth, setCardWidth] = useState(0);
  const rightColumnWidth = Math.max(
    0,
    cardWidth - cardPadding - doroColumnWidth - cardContentGap,
  );
  const imageHeightLimit = Math.max(
    0,
    maxHeight - cardPadding - exampleLabelHeight - exampleLabelGap,
  );
  const imageHeightFromWidth = rightColumnWidth
    ? rightColumnWidth / exampleImageAspectRatio
    : imageHeightLimit;
  const imageHeight = Math.min(imageHeightLimit, imageHeightFromWidth);
  const imageWidth = imageHeight * exampleImageAspectRatio;
  const doroSize = Math.min(
    doroImageSize,
    Math.max(0, maxHeight - cardPadding),
  );

  const handleCardLayout = (event: LayoutChangeEvent) => {
    setCardWidth(event.nativeEvent.layout.width);
  };

  return (
    <Card
      className="w-full flex-row items-center gap-5 rounded-2xl border-zinc-800 bg-zinc-900"
      onLayout={handleCardLayout}
      style={maxHeight ? { height: maxHeight } : undefined}
    >
      <View
        className="items-center justify-center"
        style={{ width: doroColumnWidth }}
      >
        <View style={{ height: doroSize, width: doroSize }}>
          <Image
            source={require("@/assets/doro_like.gif")}
            style={{ height: "100%", width: "100%" }}
            contentFit="contain"
          />
        </View>
      </View>

      <View className="flex-1 gap-1">
        <Text className="text-center font-semibold text-orange-400">
          {t("landing.example")}
        </Text>
        <View
          className="self-center overflow-hidden rounded-2xl border border-white"
          style={{ height: imageHeight, width: imageWidth }}
        >
          <Image
            source={require("@/assets/example.jpeg")}
            style={{ height: "100%", width: "100%" }}
            contentFit="contain"
          />
        </View>
      </View>
    </Card>
  );
}
