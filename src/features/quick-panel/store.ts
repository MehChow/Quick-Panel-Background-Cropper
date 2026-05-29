import { create } from "zustand";
import { s25PlusOneUi85Preset } from "./preset";
import { clampTransform, getFitTransform } from "./transform";
import type { GeneratedExport, ImageTransform, PickedImage } from "./types";

interface QuickPanelState {
  presetId: string;
  image: PickedImage | null;
  transform: ImageTransform;
  exports: GeneratedExport[];
  isExporting: boolean;
  error: string | null;
  setImage: (image: PickedImage) => void;
  setTransform: (transform: ImageTransform) => void;
  resetFit: () => void;
  startExport: () => void;
  finishExport: (exports: GeneratedExport[]) => void;
  failExport: (message: string) => void;
}

const emptyTransform: ImageTransform = { x: 0, y: 0, scale: 1 };

export const useQuickPanelStore = create<QuickPanelState>((set, get) => ({
  presetId: s25PlusOneUi85Preset.id,
  image: null,
  transform: emptyTransform,
  exports: [],
  isExporting: false,
  error: null,
  setImage: (image) =>
    set({
      image,
      transform: getFitTransform(image),
      exports: [],
      error: null,
    }),
  setTransform: (transform) => {
    const image = get().image;
    set({ transform: image ? clampTransform(transform, image) : transform });
  },
  resetFit: () => {
    const image = get().image;
    if (image) {
      set({ transform: getFitTransform(image), error: null });
    }
  },
  startExport: () => set({ isExporting: true, error: null, exports: [] }),
  finishExport: (exports) => set({ isExporting: false, exports }),
  failExport: (message) => set({ isExporting: false, error: message }),
}));
