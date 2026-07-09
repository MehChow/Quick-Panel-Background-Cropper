import { images } from "@/data/images";
import { Text } from "@/components/ani-ui/text";
import { cn } from "@/lib/utils";
import { Image } from "expo-image";
import { useRef, useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  View,
  type GestureResponderEvent,
} from "react-native";
import type { CustomizationMode } from "../model/types";

const advancedImages = [
  images.modeAdvanced1,
  images.modeAdvanced2,
  images.modeAdvanced3,
] as const;

interface ModeOptionCardProps {
  isSelected: boolean;
  label: string;
  mode: CustomizationMode;
  onPress: () => void;
}

export function ModeOptionCard({
  isSelected,
  label,
  mode,
  onPress,
}: ModeOptionCardProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [carouselWidth, setCarouselWidth] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    if (!layoutMeasurement.width) {
      return;
    }

    const nextIndex = Math.round(contentOffset.x / layoutMeasurement.width);
    setPageIndex(nextIndex);
  };

  const handleTouchStart = (event: GestureResponderEvent) => {
    touchStartRef.current = {
      x: event.nativeEvent.pageX,
      y: event.nativeEvent.pageY,
    };
  };

  const handleTouchEnd = (event: GestureResponderEvent) => {
    const touchStart = touchStartRef.current;
    touchStartRef.current = null;
    if (!touchStart) {
      return;
    }

    const deltaX = Math.abs(event.nativeEvent.pageX - touchStart.x);
    const deltaY = Math.abs(event.nativeEvent.pageY - touchStart.y);
    if (deltaX < 8 && deltaY < 8) {
      onPress();
    }
  };

  return (
    <View
      className={cn(
        "w-full",
        isSelected ? "opacity-100" : "opacity-55",
      )}
    >
      <View
        className="max-h-[460px] w-full self-center overflow-hidden rounded-2xl border border-white/15 bg-zinc-900/80"
      >
        {mode === "default" ? (
          <Pressable
            accessibilityLabel={label}
            accessibilityRole="button"
            className="active:opacity-90"
            onPress={onPress}
          >
            <Image
              source={images.modeDefault}
              contentFit="cover"
              className="max-h-[460px] w-full"
              style={{ aspectRatio: 0.48 }}
            />
          </Pressable>
        ) : (
          <View
            accessible={true}
            accessibilityLabel={label}
            accessibilityRole="button"
            onLayout={(event) =>
              setCarouselWidth(event.nativeEvent.layout.width)
            }
            onTouchEnd={handleTouchEnd}
            onTouchStart={handleTouchStart}
          >
            <FlatList
              horizontal
              bounces={false}
              data={advancedImages}
              decelerationRate="fast"
              disableIntervalMomentum
              keyExtractor={(_, index) => `${index}`}
              snapToAlignment="start"
              snapToInterval={carouselWidth || undefined}
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScroll}
              renderItem={({ item }) => (
                <Image
                  source={item}
                  contentFit="cover"
                  className="max-h-[460px]"
                  style={{
                    aspectRatio: 0.48,
                    width: carouselWidth,
                  }}
                />
              )}
            />
            <View className="absolute bottom-3 left-0 right-0 flex-row items-center justify-center gap-1.5">
              {advancedImages.map((_, index) => (
                <View
                  key={index}
                  className={cn(
                    "h-2.5 w-2.5 rounded-full border border-orange-200/80",
                    pageIndex === index ? "bg-orange-200" : "bg-transparent",
                  )}
                />
              ))}
            </View>
          </View>
        )}
      </View>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        className="active:opacity-80"
        onPress={onPress}
      >
        <Text className="pb-2 pt-3 text-center text-lg font-semibold text-white">
          {label}
        </Text>
      </Pressable>
    </View>
  );
}
