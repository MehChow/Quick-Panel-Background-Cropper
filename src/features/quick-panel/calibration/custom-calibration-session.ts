import type {
  CustomCalibrationSession,
  PickedImage,
} from "../model/types";

const AUTOMATIC_BOTTOM_CROP_RATIO = 0.165;

export function createEmptyCustomCalibrationSession(): CustomCalibrationSession {
  return {
    bottomCropTopY: null,
    bottomOffsetY: null,
    bottomScreenshot: null,
    mergedHeight: null,
    sourceMode: "single",
    topScreenshot: null,
  };
}

export function canUseAsSecondCustomScreenshot(
  topScreenshot: PickedImage,
  bottomScreenshot: PickedImage,
) {
  return (
    isPortraitScreenshot(topScreenshot) &&
    isPortraitScreenshot(bottomScreenshot) &&
    topScreenshot.width === bottomScreenshot.width
  );
}

export function getMergedCustomScreenshotMetrics(
  topScreenshot: PickedImage,
  bottomScreenshot: PickedImage,
  bottomOffsetY: number,
  bottomCropTopY = 0,
) {
  const visibleBottomScreenshot = getVisibleBottomScreenshotMetrics(
    bottomScreenshot,
    bottomCropTopY,
  );

  return {
    height: Math.max(
      topScreenshot.height,
      bottomOffsetY + visibleBottomScreenshot.height,
    ),
    width: topScreenshot.width,
  };
}

export function clampBottomCropTopY(
  cropTopY: number,
  screenshotHeight: number,
) {
  const maxTrim = Math.min(screenshotHeight * 0.2, 240);
  return Math.max(0, Math.min(maxTrim, cropTopY));
}

export function getAutomaticBottomCropTopY(bottomScreenshot: PickedImage) {
  const estimatedTrim = Math.round(
    bottomScreenshot.width * AUTOMATIC_BOTTOM_CROP_RATIO,
  );
  return clampBottomCropTopY(estimatedTrim, bottomScreenshot.height);
}

export function getVisibleBottomScreenshotMetrics(
  bottomScreenshot: PickedImage,
  bottomCropTopY: number,
) {
  const trimmedTopY = clampBottomCropTopY(
    bottomCropTopY,
    bottomScreenshot.height,
  );

  return {
    height: Math.max(1, bottomScreenshot.height - trimmedTopY),
    width: bottomScreenshot.width,
  };
}

export function clampBottomOffsetY(offsetY: number, topScreenshotHeight: number) {
  return Math.max(0, Math.min(topScreenshotHeight, offsetY));
}

function isPortraitScreenshot(screenshot: PickedImage) {
  return screenshot.height > screenshot.width;
}
