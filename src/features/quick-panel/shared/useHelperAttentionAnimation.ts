import { useEffect } from "react";
import {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useReducedMotionEnabled } from "./useReducedMotionEnabled";

interface UseHelperAttentionAnimationOptions {
  enabled: boolean;
}

export function useHelperAttentionAnimation({
  enabled,
}: UseHelperAttentionAnimationOptions) {
  const isReducedMotionEnabled = useReducedMotionEnabled();
  const wiggle = useSharedValue(0);
  const pulseOne = useSharedValue(0);
  const pulseTwo = useSharedValue(0);
  const shouldAnimate = enabled && !isReducedMotionEnabled;

  useEffect(() => {
    if (!shouldAnimate) {
      cancelAnimation(wiggle);
      cancelAnimation(pulseOne);
      cancelAnimation(pulseTwo);
      wiggle.value = 0;
      pulseOne.value = 0;
      pulseTwo.value = 0;
      return;
    }

    wiggle.value = withRepeat(
      withSequence(
        withTiming(-1, { duration: 70 }),
        withTiming(1, { duration: 70 }),
        withTiming(-0.75, { duration: 70 }),
        withTiming(0.75, { duration: 70 }),
        withTiming(0, { duration: 90 }),
        withTiming(0, { duration: 1070 }),
      ),
      -1,
      false,
    );
    pulseOne.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 720 }),
        withTiming(0, { duration: 0 }),
        withTiming(0, { duration: 720 }),
      ),
      -1,
      false,
    );
    pulseTwo.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 220 }),
        withTiming(1, { duration: 720 }),
        withTiming(0, { duration: 0 }),
        withTiming(0, { duration: 500 }),
      ),
      -1,
      false,
    );
  }, [pulseOne, pulseTwo, shouldAnimate, wiggle]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${wiggle.value * 9}deg` }],
  }));

  const firstPulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOne.value > 0 ? 0.22 * (1 - pulseOne.value) : 0,
    transform: [{ scale: 1 + Math.max(pulseOne.value, 0) * 0.85 }],
  }));

  const secondPulseStyle = useAnimatedStyle(() => ({
    opacity: pulseTwo.value > 0 ? 0.14 * (1 - pulseTwo.value) : 0,
    transform: [{ scale: 1 + Math.max(pulseTwo.value, 0) * 1.05 }],
  }));

  return {
    firstPulseStyle,
    iconAnimatedStyle,
    secondPulseStyle,
    shouldAnimate,
  };
}
