import { createExportSurfaceReadiness } from "@/features/quick-panel/customize/export-surface-readiness";

describe("createExportSurfaceReadiness", () => {
  it("only reports ready after every expected panel loads", () => {
    const readiness = createExportSurfaceReadiness([
      "buttonBox",
      "mediaPlayer",
      "brightness",
      "volume",
    ]);

    expect(readiness.markLoaded("buttonBox")).toBe(false);
    expect(readiness.markLoaded("mediaPlayer")).toBe(false);
    expect(readiness.markLoaded("brightness")).toBe(false);
    expect(readiness.markLoaded("volume")).toBe(true);
  });

  it("ignores duplicate load events", () => {
    const readiness = createExportSurfaceReadiness([
      "buttonBox",
      "mediaPlayer",
    ]);

    expect(readiness.markLoaded("buttonBox")).toBe(false);
    expect(readiness.markLoaded("buttonBox")).toBe(false);
    expect(readiness.markLoaded("mediaPlayer")).toBe(true);
  });

  it("accepts dynamic button ids", () => {
    const readiness = createExportSurfaceReadiness(["button-1", "button-2"]);

    expect(readiness.markLoaded("button-2")).toBe(false);
    expect(readiness.markLoaded("button-1")).toBe(true);
  });
});
