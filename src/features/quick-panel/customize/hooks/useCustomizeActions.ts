import { useOwnedImageCache } from "../../cache/useOwnedImageCache";
import { useImageImport } from "../../image-import/useImageImport";
import { useQuickPanelStore } from "../../store/quick-panel-store";

export function useCustomizeActions() {
  const ownedImageCache = useOwnedImageCache();
  const resetFit = useQuickPanelStore((state) => state.resetFit);
  const { importImage: pickImage } = useImageImport((image) => {
    const state = useQuickPanelStore.getState();
    ownedImageCache.track(image);
    state.finishImageProcessing(image);
    ownedImageCache.release(state.image);
  });
  return { pickImage, resetFit };
}
