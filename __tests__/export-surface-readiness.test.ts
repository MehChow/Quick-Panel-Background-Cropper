import { createExportSurfaceReadiness } from "@/features/quick-panel/customize/export-surface-readiness";

describe("createExportSurfaceReadiness", () => {
  it("only reports ready after every expected panel loads", () => {
    const readiness = createExportSurfaceReadiness([
      "buttonBox",
      "mediaPlayer",
      "brightness",
      "volume",
    ]);

    expect(readiness.markImageLoaded("buttonBox")).toBe(false);
    expect(readiness.markImageLoaded("mediaPlayer")).toBe(false);
    expect(readiness.markImageLoaded("brightness")).toBe(false);
    expect(readiness.markImageLoaded("volume")).toBe(true);
  });

  it("ignores duplicate load events", () => {
    const readiness = createExportSurfaceReadiness([
      "buttonBox",
      "mediaPlayer",
    ]);

    expect(readiness.markImageLoaded("buttonBox")).toBe(false);
    expect(readiness.markImageLoaded("buttonBox")).toBe(false);
    expect(readiness.markImageLoaded("mediaPlayer")).toBe(true);
  });

  it("accepts dynamic button ids", () => {
    const readiness = createExportSurfaceReadiness(["button-1", "button-2"]);

    expect(readiness.markImageLoaded("button-2")).toBe(false);
    expect(readiness.markImageLoaded("button-1")).toBe(true);
  });

  it("waits for required horizontal identifier measurements", () => {
    const readiness = createExportSurfaceReadiness(
      ["button-1", "button-2"],
      ["button-1"],
    );

    expect(readiness.markImageLoaded("button-1")).toBe(false);
    expect(readiness.markImageLoaded("button-2")).toBe(false);
    expect(readiness.markIdentifierReady("button-1")).toBe(true);
  });

  it("ignores identifier events for panels that do not require measurement", () => {
    const readiness = createExportSurfaceReadiness(["button-1"], []);

    expect(readiness.markIdentifierReady("button-1")).toBe(false);
    expect(readiness.markImageLoaded("button-1")).toBe(true);
  });
});
