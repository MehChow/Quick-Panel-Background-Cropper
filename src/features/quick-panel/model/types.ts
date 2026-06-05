import type { RefObject } from "react";
import type { View } from "react-native";
import type {
  CalibrationMode,
  CalibrationProfile,
  SavedCalibrationProfiles,
} from "./calibration-profile";

export type PanelId = "buttonBox" | "brightness" | "volume" | "mediaPlayer";

export interface PanelRect {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
}

export interface PanelDefinition {
  id: PanelId;
  label: string;
  fileName: string;
  rect: PanelRect;
}

export interface QuickPanelPreset {
  id: string;
  label: string;
  width: number;
  height: number;
  panels: Record<PanelId, PanelDefinition>;
  visualOrder: PanelId[];
  goodLockOrder: PanelId[];
}

export interface PickedImage {
  uri: string;
  width: number;
  height: number;
  fileName?: string | null;
}

export interface ImageTransform {
  x: number;
  y: number;
  scale: number;
}

export interface GeneratedExport {
  id: PanelId;
  label: string;
  fileName: string;
  previewUri: string;
  uri: string;
}

export type ExportRefs = Record<PanelId, RefObject<View | null>>;

export type QuickPanelStep =
  | "landing"
  | "calibration"
  | "imageSelection"
  | "adjustBackground"
  | "exported";

export interface CalibrationStateSnapshot {
  isCalibrated: boolean;
  mode: CalibrationMode;
  profile: CalibrationProfile | null;
  rect: PanelRect | null;
  savedProfiles: SavedCalibrationProfiles;
}
