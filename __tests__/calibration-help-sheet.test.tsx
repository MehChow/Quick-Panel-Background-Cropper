import * as React from "react";
import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { render, screen } from "@testing-library/react-native";
import { CalibrationHelpSheet } from "@/features/quick-panel/calibration/CalibrationHelpSheet";

const mockCustomHelpImage = require("../assets/screenshots_custom/custom_calibration_greenbox.jpg");
const mockDefaultHelpImage = require("../assets/calibrate.jpeg");
const mockReact = React;
const mockText = Text;
const mockView = View;

jest.mock("@gorhom/bottom-sheet", () => ({
  __esModule: true,
  BottomSheetBackdrop: () => null,
  BottomSheetScrollView: ({ children }: { children: ReactNode }) => (
    mockReact.createElement(mockView, null, children)
  ),
  default: ({ children }: { children: ReactNode }) =>
    mockReact.createElement(mockView, null, children),
}));

jest.mock("react-i18next", () => ({
  initReactI18next: {
    init: jest.fn(),
    type: "3rdParty",
  },
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock(
  "@/features/quick-panel/calibration/CalibrationInstructionCard",
  () => ({
    CalibrationInstructionCard: ({
      imageSource,
    }: {
      imageSource?: unknown;
    }) => (
      mockReact.createElement(
        mockText,
        null,
        imageSource === mockCustomHelpImage
          ? "custom-help-image"
          : imageSource === mockDefaultHelpImage
            ? "default-help-image"
            : "unknown-help-image",
      )
    ),
  }),
);

describe("CalibrationHelpSheet", () => {
  it("renders default layout help with default copy and image", () => {
    render(
      <CalibrationHelpSheet
        calibrationMode="default-union"
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByText("calibration.defaultInstruction")).toBeTruthy();
    expect(screen.getByText("default-help-image")).toBeTruthy();
  });

  it("renders custom layout help with custom copy and image", () => {
    render(
      <CalibrationHelpSheet
        calibrationMode="custom-panels"
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByText("calibration.customInstruction")).toBeTruthy();
    expect(screen.getByText("custom-help-image")).toBeTruthy();
  });
});
