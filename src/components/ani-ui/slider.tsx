import { cva, type VariantProps } from "class-variance-authority";
import React, { useCallback, useState } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";
import { cn } from "../../lib/utils";

const sliderVariants = cva("w-full justify-center", {
  variants: {
    size: {
      sm: "h-8",
      md: "h-10",
      lg: "h-12",
    },
  },
  defaultVariants: { size: "md" },
});

export interface SliderProps
  extends
    React.ComponentPropsWithoutRef<typeof View>,
    VariantProps<typeof sliderVariants> {
  className?: string;
  trackClassName?: string;
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onValueChange?: (value: number) => void;
}

export function Slider({
  value = 0,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  size,
  onValueChange,
  className,
  trackClassName,
  ...props
}: SliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  const thumbSize = size === "lg" ? 24 : size === "sm" ? 16 : 20;

  const emitValue = useCallback(
    (locationX: number) => {
      "worklet";
      if (trackWidth <= 0) return;
      const ratio = Math.max(0, Math.min(1, locationX / trackWidth));
      const raw = min + ratio * (max - min);
      const stepped = Math.round(raw / step) * step;
      const clamped = Math.max(min, Math.min(max, stepped));
      if (onValueChange) scheduleOnRN(onValueChange, clamped);
    },
    [max, min, onValueChange, step, trackWidth],
  );

  const gesture = Gesture.Pan()
    .enabled(!disabled)
    .onBegin((e) => {
      emitValue(e.x);
    })
    .onUpdate((e) => {
      emitValue(e.x);
    })
    .minDistance(0);

  return (
    <GestureDetector gesture={gesture}>
      <View
        className={cn(
          sliderVariants({ size }),
          disabled && "opacity-50",
          className,
        )}
        accessible={true}
        accessibilityRole="adjustable"
        accessibilityValue={{ min, max, now: value }}
        onLayout={(e) => {
          setTrackWidth(e.nativeEvent.layout.width);
        }}
        {...props}
      >
        <View className={cn("h-1.5 w-full rounded-full bg-slate-600 overflow-hidden", trackClassName)}>
          <View
            className="h-full rounded-full bg-white"
            style={{ width: `${pct}%` }}
          />
        </View>
        <View
          style={{
            position: "absolute",
            left: `${pct}%`,
            marginLeft: -(thumbSize / 2),
            width: thumbSize,
            height: thumbSize,
            borderRadius: thumbSize / 2,
            borderWidth: 2,
            borderColor: "#fafafa",
            backgroundColor: "#18181b",
          }}
        />
      </View>
    </GestureDetector>
  );
}
