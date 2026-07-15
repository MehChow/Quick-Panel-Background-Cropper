import { resetButtonAreaPreviewAnimation } from "@/features/quick-panel/calibration/advanced/button-area-preview-animation";

describe("button area preview animation", () => {
  it("clears stale translation before measuring a reopened preview", () => {
    const progress = { value: 1 };
    const originX = { value: 240 };
    const originY = { value: -180 };

    resetButtonAreaPreviewAnimation(progress, originX, originY);

    expect(progress.value).toBe(0);
    expect(originX.value).toBe(0);
    expect(originY.value).toBe(0);
  });
});
