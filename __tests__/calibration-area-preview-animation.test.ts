import { resetCalibrationAreaPreviewAnimation } from "@/features/quick-panel/calibration/advanced/calibration-area-preview-animation";

describe("calibration area preview animation", () => {
  it("clears stale translation before measuring a reopened preview", () => {
    const progress = { value: 1 };
    const originX = { value: 240 };
    const originY = { value: -180 };

    resetCalibrationAreaPreviewAnimation(progress, originX, originY);

    expect(progress.value).toBe(0);
    expect(originX.value).toBe(0);
    expect(originY.value).toBe(0);
  });
});
