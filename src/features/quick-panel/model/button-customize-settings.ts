import {
  defaultButtonIdentifierBackgroundTheme,
  defaultButtonIdentifierColor,
  type ButtonIdentifierBackgroundTheme,
} from "./button-identifier-color";
import type { ButtonIdentifierContentMode } from "./button-identifier-content";

export interface ButtonCustomizeSettings {
  buttonIdentifierBackgroundTheme: ButtonIdentifierBackgroundTheme;
  buttonIdentifierColor: string;
  buttonIdentifierContentMode: ButtonIdentifierContentMode;
  buttonIdentifierOpacity: number;
  buttonPanelOpacity: number;
  horizontalIdentifierPosition: number;
  verticalIdentifierPosition: number;
}

export const defaultButtonCustomizeSettings: ButtonCustomizeSettings = {
  buttonIdentifierBackgroundTheme: defaultButtonIdentifierBackgroundTheme,
  buttonIdentifierColor: defaultButtonIdentifierColor,
  buttonIdentifierContentMode: "both",
  buttonIdentifierOpacity: 70,
  buttonPanelOpacity: 78,
  horizontalIdentifierPosition: 50,
  verticalIdentifierPosition: 50,
};

export const defaultCombinedButtonImageIntensity = 78;
