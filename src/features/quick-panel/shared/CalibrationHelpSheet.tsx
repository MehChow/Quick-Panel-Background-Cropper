import { Text } from "@/components/ani-ui/text";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import type { ScrollEventsHandlersHookType } from "@gorhom/bottom-sheet";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutChangeEvent,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  useWindowDimensions,
  View,
} from "react-native";
import { CalibrationOuterExample } from "./CalibrationOuterExample";
import { CalibrationOuterTips } from "./CalibrationOuterTips";

interface CalibrationHelpSheetProps {
  onClose: () => void;
}

interface HelpSlide {
  id: "tips" | "example";
}

const helpSlides: HelpSlide[] = [{ id: "tips" }, { id: "example" }];

const useHorizontalPagerScrollEvents: ScrollEventsHandlersHookType = (
  _ref,
  contentOffsetY
) => ({
  handleOnScroll: ({ contentOffset: { y } }) => {
    "worklet";
    contentOffsetY.value = y;
  },
  handleOnBeginDrag: ({ contentOffset: { y } }) => {
    "worklet";
    contentOffsetY.value = y;
  },
  handleOnEndDrag: ({ contentOffset: { y } }) => {
    "worklet";
    contentOffsetY.value = y;
  },
  handleOnMomentumEnd: ({ contentOffset: { y } }) => {
    "worklet";
    contentOffsetY.value = y;
  },
});

export function CalibrationHelpSheet({ onClose }: CalibrationHelpSheetProps) {
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const [slideWidth, setSlideWidth] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const snapPoint = Math.min(height * 0.78, 640);

  function handlePagerLayout(event: LayoutChangeEvent) {
    const nextWidth = Math.round(event.nativeEvent.layout.width);

    if (nextWidth !== slideWidth) {
      setSlideWidth(nextWidth);
    }
  }

  function handleScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    if (!slideWidth) {
      return;
    }

    const nextPage = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
    setPageIndex(nextPage);
  }

  const renderSlide: ListRenderItem<HelpSlide> = ({ item }) => (
    <View className="px-5" style={{ width: slideWidth }}>
      {item.id === "tips" ? (
        <CalibrationOuterTips />
      ) : (
        <CalibrationOuterExample />
      )}
    </View>
  );

  return (
    <BottomSheet
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.6}
          pressBehavior="close"
        />
      )}
      backgroundStyle={{
        backgroundColor: "#18181b",
        borderWidth: 1,
        borderColor: "#27272a",
        borderRadius: 32,
      }}
      enableDynamicSizing={false}
      enableOverDrag={false}
      enablePanDownToClose
      handleIndicatorStyle={{
        backgroundColor: "#52525b",
        height: 6,
        width: 48,
      }}
      index={0}
      onClose={onClose}
      snapPoints={[snapPoint]}
    >
      <BottomSheetView className="pb-8 pt-2">
        <View className="mb-5 flex-row items-start gap-4">
          <View className="flex-1 gap-4 px-5">
            <Text className="text-lg font-semibold text-white">
              {t("calibration.helpTitle")}
            </Text>
            <Text className="text-sm font-medium leading-6 text-zinc-300">
              {t("calibration.instruction")}
            </Text>
          </View>
        </View>

        <View className="h-100" onLayout={handlePagerLayout}>
          {slideWidth > 0 ? (
            <BottomSheetFlatList
              data={helpSlides}
              horizontal
              pagingEnabled
              getItemLayout={(_, index) => ({
                index,
                length: slideWidth,
                offset: slideWidth * index,
              })}
              keyExtractor={(item) => item.id}
              renderItem={renderSlide}
              scrollEventsHandlersHook={useHorizontalPagerScrollEvents}
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScrollEnd}
            />
          ) : null}
        </View>

        <View className="mt-3 flex-row justify-center gap-3">
          {[0, 1].map((index) => (
            <View
              key={index}
              className={pageIndex === index ? "bg-zinc-300" : "bg-zinc-600"}
              style={{ borderRadius: 999, height: 6, width: 48 }}
            />
          ))}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
