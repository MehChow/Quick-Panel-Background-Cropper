import { getPanelUnion } from "../../model/panel-geometry";
import type { PanelRect } from "../../model/types";
import { getCalibratedPreset } from "../shared/calibration-preset";

export function getDefaultDisplayRect(rect: PanelRect): PanelRect {
  return getPanelUnion(getCalibratedPreset(rect));
}
