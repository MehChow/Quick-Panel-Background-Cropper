import type { PanelRect, PickedImage } from "../../../model/types";
import { RectSelectionOverlay } from "../../shared/RectSelectionOverlay";

interface Props {
  rect: PanelRect;
  scale: number;
  screenshot: PickedImage;
  onRectChange: (rect: PanelRect) => void;
}

export function AdvancedOuterOverlay({
  rect,
  scale,
  screenshot,
  onRectChange,
}: Props) {
  return (
    <RectSelectionOverlay
      displayRect={rect}
      rect={rect}
      scale={scale}
      screenshot={screenshot}
      onRectChange={onRectChange}
    />
  );
}
