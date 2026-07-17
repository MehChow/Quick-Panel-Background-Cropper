export function createExportSurfaceReadiness(
  waitsForIdentifier: boolean,
) {
  let isImageReady = false;
  let isIdentifierReady = !waitsForIdentifier;

  return {
    markIdentifierReady() {
      if (!waitsForIdentifier) {
        return false;
      }
      isIdentifierReady = true;
      return isImageReady && isIdentifierReady;
    },
    markImageLoaded() {
      isImageReady = true;
      return isImageReady && isIdentifierReady;
    },
  };
}
