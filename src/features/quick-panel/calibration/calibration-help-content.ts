import type { ImageSource } from "expo-image";
import type { CalibrationMode } from "../model/calibration-profile";

export interface CalibrationHelpContent {
  imageSource: ImageSource | number;
  instructionKey: string;
}

export const calibrationHelpContentByMode = {
  "custom-panels": {
    imageSource: require("../../../../assets/calibrate_customized.jpg"),
    instructionKey: "calibration.customInstruction",
  },
  "default-union": {
    imageSource: require("../../../../assets/calibrate.jpeg"),
    instructionKey: "calibration.defaultInstruction",
  },
} satisfies Record<CalibrationMode, CalibrationHelpContent>;
