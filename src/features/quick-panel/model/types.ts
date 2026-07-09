import type { RefObject } from "react";
import type { View } from "react-native";

export type PanelId = "buttonBox" | "brightness" | "volume" | "mediaPlayer";
export type CustomizationMode = "default" | "advanced";

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
  mode: CustomizationMode;
  width: number;
  height: number;
  customizationArea: PanelRect;
  panels: Record<PanelId, PanelDefinition>;
  visualOrder: PanelId[];
  goodLockOrder: PanelId[];
}

export type PanelRects = Record<PanelId, PanelRect>;

export interface DefaultCalibration {
  rect: PanelRect;
}

export interface AdvancedSnapGrid {
  columns: number;
  rows: number;
}

export interface AdvancedCalibration {
  screenshotWidth: number;
  screenshotHeight: number;
  grid: AdvancedSnapGrid;
  outerRect: PanelRect;
  enabledPanels: PanelId[];
  panels: PanelRects;
}

export interface AdvancedCalibrationDraft {
  screenshot: PickedImage | null;
  outerRect: PanelRect | null;
  enabledPanels: PanelId[];
  panels: PanelRects | null;
}

export interface PickedImage {
  uri: string;
  width: number;
  height: number;
  fileName?: string | null;
  originalWidth?: number;
  originalHeight?: number;
  wasOptimized?: boolean;
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
  | "selectMode"
  | "calibration"
  | "advancedCalibration"
  | "imageSelection"
  | "adjustBackground"
  | "exported";
