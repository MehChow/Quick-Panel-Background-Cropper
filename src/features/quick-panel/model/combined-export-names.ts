import { createButtonFileNameSlugs } from "./button-export-names";
import type { ControlPanelId } from "./types";

const controlFileNameSlugs: Record<ControlPanelId, string> = {
  buttonBox: "button-box",
  brightness: "brightness",
  volume: "volume",
  mediaPlayer: "media-player",
};

export function createCombinedPanelFileNames(
  controlsInExportOrder: ControlPanelId[],
  buttonLabels: string[],
): string[] {
  const controlNames = controlsInExportOrder.map((id) =>
    `control-${controlFileNameSlugs[id]}`
  );
  const buttonNames = createButtonFileNameSlugs(buttonLabels).map((slug) =>
    `button-${slug}`
  );
  return [...controlNames, ...buttonNames].map((name, index) =>
    `${String(index + 1).padStart(2, "0")}-${name}.png`
  );
}
