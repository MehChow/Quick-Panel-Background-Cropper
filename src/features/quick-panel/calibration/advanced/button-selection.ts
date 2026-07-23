import type { CustomButtonIconId } from "../../model/button-labels";
import type {
  ButtonCalibrationItem,
  ButtonPanelId,
  PanelRect,
} from "../../model/types";

export interface ButtonSelectionChoice {
  customIconId: CustomButtonIconId | null;
  label: string;
}

export function createButtonItems(
  choices: ButtonSelectionChoice[],
  outerRect: PanelRect,
): ButtonCalibrationItem[] {
  return choices.map((choice, index) => ({
    ...choice,
    id: `button-${index + 1}` as ButtonPanelId,
    rect: getInitialButtonRect(index, choices.length, outerRect),
  }));
}

function getInitialButtonRect(
  index: number,
  count: number,
  outerRect: PanelRect,
): PanelRect {
  const columns = Math.min(2, count);
  const rows = Math.ceil(count / columns);
  const gap = 8;
  const column = index % columns;
  const row = Math.floor(index / columns);
  const width = (outerRect.width - gap * (columns + 1)) / columns;
  const height = (outerRect.height - gap * (rows + 1)) / rows;
  return {
    x: outerRect.x + gap + column * (width + gap),
    y: outerRect.y + gap + row * (height + gap),
    width,
    height,
    radius: 0,
  };
}
