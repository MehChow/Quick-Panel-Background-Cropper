import { createExportSurfaceReadiness } from "@/features/quick-panel/customize/export-surface-readiness";

describe("createExportSurfaceReadiness", () => {
  it("reports ready when an image-only surface loads", () => {
    const readiness = createExportSurfaceReadiness(false);

    expect(readiness.markIdentifierReady()).toBe(false);
    expect(readiness.markImageLoaded()).toBe(true);
  });

  it("waits for a visible horizontal identifier measurement", () => {
    const readiness = createExportSurfaceReadiness(true);

    expect(readiness.markImageLoaded()).toBe(false);
    expect(readiness.markIdentifierReady()).toBe(true);
  });

  it("waits for the image when the identifier arrives first", () => {
    const readiness = createExportSurfaceReadiness(true);

    expect(readiness.markIdentifierReady()).toBe(false);
    expect(readiness.markImageLoaded()).toBe(true);
  });

  it("keeps duplicate events idempotent", () => {
    const readiness = createExportSurfaceReadiness(true);

    expect(readiness.markImageLoaded()).toBe(false);
    expect(readiness.markImageLoaded()).toBe(false);
    expect(readiness.markIdentifierReady()).toBe(true);
  });
});
