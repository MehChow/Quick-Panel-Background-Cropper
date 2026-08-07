import {
  createSnapAxis,
  maybeSnap,
} from "@/features/quick-panel/calibration/advanced/advanced-snap-axis";

describe("advanced snap axis sensitivity", () => {
  it("increases capture and release thresholds from Low to Strong", () => {
    const low = createSnapAxis(0, 400, 4, {
      scale: 1,
      sensitivity: "low",
    });
    const balanced = createSnapAxis(0, 400, 4, {
      scale: 1,
      sensitivity: "balanced",
    });
    const strong = createSnapAxis(0, 400, 4, {
      scale: 1,
      sensitivity: "strong",
    });

    expect(low.captureThreshold).toBe(10);
    expect(balanced.captureThreshold).toBe(20);
    expect(strong.captureThreshold).toBe(30);
    expect(low.releaseThreshold).toBe(3.5);
    expect(balanced.releaseThreshold).toBe(7);
    expect(strong.releaseThreshold).toBe(10.5);
  });

  it("keeps the same perceived threshold across canvas scales", () => {
    const scaleOne = createSnapAxis(0, 200, 4, {
      scale: 1,
      sensitivity: "balanced",
    });
    const scaleTwo = createSnapAxis(0, 100, 4, {
      scale: 2,
      sensitivity: "balanced",
    });

    expect(scaleOne.captureThreshold * 1).toBe(12);
    expect(scaleTwo.captureThreshold * 2).toBe(12);
    expect(scaleOne.releaseThreshold * 1).toBe(4);
    expect(scaleTwo.releaseThreshold * 2).toBe(4);
  });

  it("does not change lines or snap candidates between strengths", () => {
    const low = createSnapAxis(0, 400, 4, {
      scale: 1,
      sensitivity: "low",
    });
    const strong = createSnapAxis(0, 400, 4, {
      scale: 1,
      sensitivity: "strong",
    });

    expect(low.lines).toEqual(strong.lines);
    expect(low.candidates).toEqual(strong.candidates);
  });

  it.each([
    ["bottom", 99, 94],
    ["bottom", 101, 94],
    ["top", 99, 106],
    ["top", 101, 106],
    ["right", 99, 94],
    ["right", 101, 94],
    ["left", 99, 106],
    ["left", 101, 106],
  ] as const)(
    "keeps the %s edge on its owned side when dragged to %i",
    (edge, value, expected) => {
      const axis = createSnapAxis(0, 400, 4, {
        scale: 1,
        sensitivity: "balanced",
      });

      expect(maybeSnap(value, 50, axis, edge).value).toBe(expected);
    },
  );

  it.each(["low", "balanced", "strong"] as const)(
    "keeps directional destinations unchanged at %s sensitivity",
    (sensitivity) => {
      const axis = createSnapAxis(0, 400, 4, { scale: 1, sensitivity });

      expect(maybeSnap(100, 50, axis, "bottom").value).toBe(94);
      expect(maybeSnap(100, 50, axis, "top").value).toBe(106);
      expect(maybeSnap(100, 50, axis, "right").value).toBe(94);
      expect(maybeSnap(100, 50, axis, "left").value).toBe(106);
    },
  );

  it("keeps exact outer boundaries available to both directions", () => {
    const axis = createSnapAxis(0, 400, 4, {
      scale: 1,
      sensitivity: "balanced",
    });

    expect(maybeSnap(3, 50, axis, "left").value).toBe(0);
    expect(maybeSnap(3, 50, axis, "right").value).toBe(0);
    expect(maybeSnap(397, 350, axis, "left").value).toBe(400);
    expect(maybeSnap(397, 350, axis, "right").value).toBe(400);
  });
});
