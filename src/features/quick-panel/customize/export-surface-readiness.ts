import type { PanelId } from "../model/types";

export function createExportSurfaceReadiness(expectedIds: PanelId[]) {
  const loadedIds = new Set<PanelId>();

  return {
    markLoaded(id: PanelId) {
      loadedIds.add(id);
      return expectedIds.every((expectedId) => loadedIds.has(expectedId));
    },
  };
}
