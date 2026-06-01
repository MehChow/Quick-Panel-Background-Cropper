import { Text } from "@/components/ani-ui/text";
import {
  isSupportedLanguage,
  saveLanguageOverride,
  type SupportedLanguage,
} from "@/features/quick-panel/storage";
import { useTranslation } from "react-i18next";
import { Pressable, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const buttonSize = 52;
const edgePadding = 16;

function getCurrentLanguage(language: string): SupportedLanguage {
  const languageCode = language.split("-")[0];

  if (isSupportedLanguage(languageCode)) {
    return languageCode;
  }

  return "en";
}

export function LanguageSwitchButton() {
  const { i18n } = useTranslation();
  const currentLanguage = getCurrentLanguage(i18n.language);
  const nextLanguage: SupportedLanguage =
    currentLanguage === "en" ? "zh" : "en";
  const label = currentLanguage === "en" ? "\u4e2d" : "ENG";

  const changeLanguage = () => {
    saveLanguageOverride(nextLanguage);
    void i18n.changeLanguage(nextLanguage);
  };

  return (
    <Pressable
      accessibilityLabel="Switch language"
      accessibilityRole="button"
      className="active:opacity-75"
      hitSlop={10}
      onPress={changeLanguage}
    >
      <Text className="text-center text-base font-bold tracking-wide text-black">
        {label}
      </Text>
    </Pressable>
  );
}

export function FloatingLanguageSwitchButton() {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const minY = insets.top + edgePadding;
  const maxX = Math.max(edgePadding, width - buttonSize - edgePadding);
  const maxY = Math.max(
    minY,
    height - buttonSize - insets.bottom - edgePadding,
  );
  const offsetX = useSharedValue(edgePadding);
  const offsetY = useSharedValue(maxY);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const pan = Gesture.Pan()
    .minDistance(4)
    .onStart(() => {
      startX.value = offsetX.value;
      startY.value = offsetY.value;
    })
    .onUpdate((event) => {
      offsetX.value = Math.min(
        maxX,
        Math.max(edgePadding, startX.value + event.translationX),
      );
      offsetY.value = Math.min(
        maxY,
        Math.max(minY, startY.value + event.translationY),
      );
    })
    .onEnd(() => {
      offsetX.value = withSpring(
        Math.min(maxX, Math.max(edgePadding, offsetX.value)),
      );
      offsetY.value = withSpring(Math.min(maxY, Math.max(minY, offsetY.value)));
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }, { translateY: offsetY.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        className="absolute left-0 top-0 z-50 items-center justify-center rounded-full bg-white shadow-lg"
        style={[
          {
            elevation: 24,
            height: buttonSize,
            width: buttonSize,
          },
          animatedStyle,
        ]}
      >
        <LanguageSwitchButton />
      </Animated.View>
    </GestureDetector>
  );
}
