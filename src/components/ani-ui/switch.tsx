import React, { useEffect } from "react";
import { Pressable, Text, Switch as RNSwitch, useColorScheme } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { cn } from "../../lib/utils";

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof RNSwitch> {
  className?: string;
  offLabel?: string;
  onLabel?: string;
  trackColorOff?: string;
  trackColorOn?: string;
  thumbColor?: string;
}

export function Switch({
  className,
  offLabel = "OFF",
  onLabel = "ON",
  trackColorOff,
  trackColorOn,
  thumbColor,
  value,
  ...props
}: SwitchProps) {
  const dark = useColorScheme() === "dark";
  const isOn = Boolean(value);
  const off = trackColorOff ?? (dark ? "#2c2328" : "#e4e4e7");
  const on = trackColorOn ?? "#f3c992";
  const thumb = thumbColor ?? (isOn ? "#261e1e" : "#f5d6aa");
  const progress = useSharedValue(isOn ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isOn ? 1 : 0, {
      duration: 180,
      easing: Easing.out(Easing.cubic),
    });
  }, [isOn, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.get(), [0, 1], [off, on]),
  }));
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.get() * 18 }],
  }));

  return (
    <Pressable
      accessibilityLabel={props.accessibilityLabel}
      accessibilityRole="switch"
      accessibilityState={{ ...props.accessibilityState, disabled: props.disabled, checked: isOn }}
      className={cn(
        "relative h-8 w-[52px] flex-row items-center rounded-full border border-[#f3c992]/25 p-1",
        props.disabled && "opacity-50",
        className,
      )}
      disabled={props.disabled}
      onPress={() => props.onValueChange?.(!isOn)}
      testID={props.testID}
    >
      <Animated.View
        className="absolute inset-0 rounded-full"
        pointerEvents="none"
        style={trackStyle}
      />
      <Animated.View
        className="h-6 w-6 items-center justify-center rounded-full"
        style={[{ backgroundColor: thumb }, thumbStyle]}
      >
        <Text className={cn("text-[8px] font-bold", isOn ? "text-[#f3c992]" : "text-[#2c2328]")}>
          {isOn ? onLabel : offLabel}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
