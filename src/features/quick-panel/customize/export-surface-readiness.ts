import type { PanelId } from "../model/types";

export function createExportSurfaceReadiness(
  expectedIds: PanelId[],
  measuredIdentifierIds: PanelId[] = [],
): {
  markIdentifierReady: (id: PanelId) => boolean;
  markImageLoaded: (id: PanelId) => boolean;
} {
  const loadedImageIds = new Set<PanelId>();
  const readyIdentifierIds = new Set<PanelId>();
  const measuredIdentifierIdSet = new Set(measuredIdentifierIds);
  const isReady = () => expectedIds.every((id) => loadedImageIds.has(id))
    && measuredIdentifierIds.every((id) => readyIdentifierIds.has(id));

  return {
    markIdentifierReady(id: PanelId) {
      if (!measuredIdentifierIdSet.has(id)) return false;
      readyIdentifierIds.add(id);
      return isReady();
    },
    markImageLoaded(id: PanelId) {
      loadedImageIds.add(id);
      return isReady();
    },
  };
}
