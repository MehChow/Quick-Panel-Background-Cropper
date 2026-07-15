import { Lucide } from "@react-native-vector-icons/lucide";
import * as Haptics from "expo-haptics";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, findNodeHandle, Pressable, type LayoutChangeEvent, View } from "react-native";
import { Easing, useSharedValue, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useReducedMotionEnabled } from "../../../shared/useReducedMotionEnabled";
import type { PanelRect, PickedImage } from "../../../model/types";
import { resetCalibrationAreaPreviewAnimation } from "../calibration-area-preview-animation";
import {
  clampCalibrationAreaRect,
  fitCalibrationArea,
} from "../calibration-area-geometry";
import { CalibrationAreaPreviewOverlay } from "./CalibrationAreaPreviewOverlay";

interface Props {
  children: (previewTrigger: ReactNode) => ReactNode;
  outerRect: PanelRect;
  screenshot: PickedImage;
}

export function CalibrationAreaPreview({ children, outerRect, screenshot }: Props) {
  const triggerRef = useRef<View>(null);
  const cardRef = useRef<View>(null);
  const isPreviewOpenRef = useRef(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isOverlayMounted, setIsOverlayMounted] = useState(false);
  const [panelSize, setPanelSize] = useState({ height: 0, width: 0 });
  const progress = useSharedValue(0);
  const originX = useSharedValue(0);
  const originY = useSharedValue(0);
  const isReducedMotionEnabled = useReducedMotionEnabled();

  const finishClose = () => {
    setIsOverlayMounted(false);
    const node = findNodeHandle(triggerRef.current);
    if (node) AccessibilityInfo.setAccessibilityFocus(node);
  };
  const closePreview = () => {
    if (!isPreviewOpenRef.current) return;
    isPreviewOpenRef.current = false;
    setIsPreviewOpen(false);
    progress.value = withTiming(
      0,
      { duration: isReducedMotionEnabled ? 120 : 140 },
      (finished) => {
        if (finished) scheduleOnRN(finishClose);
      },
    );
  };
  const openPreview = () => {
    if (isPreviewOpenRef.current) return;
    isPreviewOpenRef.current = true;
    resetCalibrationAreaPreviewAnimation(progress, originX, originY);
    setIsPreviewOpen(true);
    setIsOverlayMounted(true);
    void Haptics.selectionAsync().catch(() => undefined);
  };
  useEffect(() => {
    if (!isOverlayMounted || !isPreviewOpen) return;
    const frame = requestAnimationFrame(() => {
      triggerRef.current?.measureInWindow((x, y, width, height) => {
        cardRef.current?.measureInWindow((cardX, cardY, cardWidth, cardHeight) => {
          if (!isPreviewOpenRef.current) return;
          originX.value = x + width / 2 - cardX - cardWidth / 2;
          originY.value = y + height / 2 - cardY - cardHeight / 2;
          progress.value = withTiming(1, {
            duration: isReducedMotionEnabled ? 120 : 200,
            easing: Easing.out(Easing.cubic),
          });
        });
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [isOverlayMounted, isPreviewOpen, isReducedMotionEnabled, originX, originY, progress]);
  const crop = clampCalibrationAreaRect(outerRect, screenshot);
  const previewSize = fitCalibrationArea(
    crop,
    Math.max(panelSize.width - 32, 0),
    panelSize.height * 0.6,
  );
  const trigger = (
    <Pressable
      ref={triggerRef}
      accessibilityHint="Tap to open. Tap the dimmed background to close."
      accessibilityLabel="Preview outlined area"
      accessibilityRole="button"
      className={`h-12 w-12 items-center justify-center rounded-xl border ${
        isOverlayMounted
          ? "border-emerald-300/60 bg-emerald-300/10"
          : "border-white/10 bg-zinc-950"
      }`}
      onPress={openPreview}
    >
      <Lucide color="#ffffff" name="eye" size={20} />
    </Pressable>
  );

  const handleLayout = (event: LayoutChangeEvent) => {
    setPanelSize(event.nativeEvent.layout);
  };

  return (
    <View className="min-h-0 flex-1" onLayout={handleLayout}>
      <View
        className="min-h-0 flex-1"
        importantForAccessibility={isOverlayMounted ? "no-hide-descendants" : "auto"}
      >
        {children(trigger)}
      </View>
      {isOverlayMounted ? (
        <CalibrationAreaPreviewOverlay
          cardRef={cardRef}
          crop={crop}
          isReducedMotionEnabled={isReducedMotionEnabled}
          originX={originX}
          originY={originY}
          previewSize={previewSize}
          progress={progress}
          screenshot={screenshot}
          onDismiss={closePreview}
        />
      ) : null}
    </View>
  );
}
