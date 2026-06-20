import { getFitTransform } from "@/features/quick-panel/model/image-placement";
import {
  getImageBounds,
  getImagePlacementBounds,
} from "@/features/quick-panel/model/panel-geometry";
import { goodLockOrder, visualOrder } from "@/features/quick-panel/model/preset";
import type { PickedImage, QuickPanelPreset } from "@/features/quick-panel/model/types";

const advancedFiveByFourPreset: QuickPanelPreset = {
  id: "advanced-five-by-four",
  label: "Advanced",
  mode: "advanced",
  width: 1000,
  height: 1000,
  customizationArea: { x: 50, y: 100, width: 850, height: 970, radius: 0 },
  visualOrder,
  goodLockOrder,
  panels: {
    buttonBox: {
      id: "buttonBox",
      label: "Button box",
      fileName: "01-button-box.png",
      rect: { x: 50, y: 100, width: 850, height: 190, radius: 0 },
    },
    brightness: {
      id: "brightness",
      label: "Brightness",
      fileName: "03-brightness.png",
      rect: { x: 50, y: 310, width: 620, height: 560, radius: 0 },
    },
    volume: {
      id: "volume",
      label: "Volume",
      fileName: "04-volume.png",
      rect: { x: 690, y: 310, width: 210, height: 560, radius: 0 },
    },
    mediaPlayer: {
      id: "mediaPlayer",
      label: "Media player",
      fileName: "02-media-player.png",
      rect: { x: 50, y: 890, width: 850, height: 180, radius: 0 },
    },
  },
};

const portraitImage: PickedImage = {
  uri: "file:///portrait.jpg",
  width: 1080,
  height: 1667,
};

describe("image placement bounds", () => {
  it("keeps advanced horizontal adjustment tied to the visible customization area", () => {
    const exportBounds = getImageBounds(advancedFiveByFourPreset);
    const placementBounds = getImagePlacementBounds(advancedFiveByFourPreset);

    expect(exportBounds.width).toBeGreaterThan(
      advancedFiveByFourPreset.customizationArea.width,
    );
    expect(placementBounds.width).toBe(
      advancedFiveByFourPreset.customizationArea.width,
    );
    expect(placementBounds.x).toBe(
      advancedFiveByFourPreset.customizationArea.x,
    );
  });

  it("does not let advanced export-square width eliminate horizontal pan room", () => {
    const transform = getFitTransform(portraitImage, advancedFiveByFourPreset);
    const renderedWidth = portraitImage.width * transform.scale;
    const horizontalPanRoom =
      renderedWidth - advancedFiveByFourPreset.customizationArea.width;

    expect(horizontalPanRoom).toBeGreaterThan(150);
  });
});
