import type { ImageSource } from "expo-image";
import type { CalibrationMode } from "../model/calibration-profile";

export interface CalibrationHelpContent {
  imageSource: ImageSource | number;
  instructionKey: string;
}

export const calibrationHelpContentByMode = {
  "custom-panels": {
    imageSource: require("../../../../assets/screenshots_custom/custom_calibration_greenbox.jpg"),
    instructionKey: "calibration.customInstruction",
  },
  "default-union": {
    imageSource: require("../../../../assets/calibrate.jpeg"),
    instructionKey: "calibration.defaultInstruction",
  },
} satisfies Record<CalibrationMode, CalibrationHelpContent>;
