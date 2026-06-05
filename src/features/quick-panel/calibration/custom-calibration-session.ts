import type {
  CustomCalibrationSession,
  PickedImage,
} from "../model/types";

export function createEmptyCustomCalibrationSession(): CustomCalibrationSession {
  return {
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
) {
  return {
    height: Math.max(
      topScreenshot.height,
      bottomOffsetY + bottomScreenshot.height,
    ),
    width: topScreenshot.width,
  };
}

function isPortraitScreenshot(screenshot: PickedImage) {
  return screenshot.height > screenshot.width;
}
