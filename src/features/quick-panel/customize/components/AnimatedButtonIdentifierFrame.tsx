import type { PropsWithChildren } from "react";
import type { ViewStyle } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";

interface AnimatedButtonIdentifierFrameProps extends PropsWithChildren {
  baseStyle: ViewStyle;
  hidden: boolean;
  opacity: SharedValue<number>;
}

export function AnimatedButtonIdentifierFrame({
  baseStyle,
  children,
  hidden,
  opacity,
}: AnimatedButtonIdentifierFrameProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: hidden ? 0 : opacity.get(),
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[baseStyle, animatedStyle]}
      testID="button-identifier-overlay"
    >
      {children}
    </Animated.View>
  );
}
