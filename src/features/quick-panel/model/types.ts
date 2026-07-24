import type { LucideIconName } from "@react-native-vector-icons/lucide";
import type { CustomButtonIconId } from "./button-labels";

export type ControlPanelId = "buttonBox" | "brightness" | "volume" | "mediaPlayer";
export type ButtonPanelId = `button-${number}`;
export type PanelId = ControlPanelId | ButtonPanelId;
export type PanelFamily = "control" | "button";
export type CustomizationMode = "default" | "advanced";
export type AdvancedTarget = "controls" | "buttons";
export type ButtonIdentifierTheme = "light" | "dark";

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
  family: PanelFamily;
  rect: PanelRect;
  buttonIdentifier?: ButtonIdentifierDefinition;
}

export interface ButtonIdentifierDefinition {
  columnSpan: number;
  iconName: LucideIconName;
  referenceCellSize: number;
  rowSpan: number;
}

export interface QuickPanelPreset {
  id: string;
  label: string;
  mode: CustomizationMode;
  width: number;
  height: number;
  customizationArea: PanelRect;
  panels: Record<string, PanelDefinition>;
  visualOrder: PanelId[];
  goodLockOrder: PanelId[];
}

export type ControlPanelRects = Record<ControlPanelId, PanelRect>;
export type PanelRects = Record<string, PanelRect>;

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
  isGridEnabled: boolean;
  outerRect: PanelRect;
  enabledPanels: ControlPanelId[];
  panels: ControlPanelRects;
}

export interface AdvancedCalibrationDraft {
  screenshot: PickedImage | null;
  outerRect: PanelRect | null;
  enabledPanels: ControlPanelId[];
  panels: ControlPanelRects | null;
}

export interface ButtonCalibrationItem {
  id: ButtonPanelId;
  label: string;
  customIconId: CustomButtonIconId | null;
  rect: PanelRect;
}

export interface EditablePanelItem {
  id: PanelId;
  label: string;
  family: PanelFamily;
}

export interface AdvancedButtonsCalibration {
  screenshotWidth: number;
  screenshotHeight: number;
  grid: AdvancedSnapGrid;
  isGridEnabled: boolean;
  outerRect: PanelRect;
  buttons: ButtonCalibrationItem[];
}

export interface AdvancedButtonsDraft {
  screenshot: PickedImage | null;
  outerRect: PanelRect | null;
  buttons: ButtonCalibrationItem[];
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

export type QuickPanelStep =
  | "landing"
  | "selectMode"
  | "advancedTargetSelection"
  | "calibration"
  | "advancedCalibration"
  | "imageSelection"
  | "adjustBackground"
  | "exported";
