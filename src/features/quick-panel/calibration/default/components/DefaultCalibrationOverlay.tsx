import { getPanelUnion } from "../../../model/panel-geometry";
import type { PanelRect, PickedImage } from "../../../model/types";
import { getCalibratedPreset } from "../../shared/calibration-preset";
import { RectSelectionOverlay } from "../../shared/RectSelectionOverlay";

interface Props {
  rect: PanelRect;
  scale: number;
  screenshot: PickedImage;
  onRectChange: (rect: PanelRect) => void;
}

export function DefaultCalibrationOverlay({
  rect,
  scale,
  screenshot,
  onRectChange,
}: Props) {
  const previewRect = getPanelUnion(getCalibratedPreset(rect));

  return (
    <RectSelectionOverlay
      displayRect={previewRect}
      rect={rect}
      scale={scale}
      screenshot={screenshot}
      onRectChange={onRectChange}
    />
  );
}
