import { AdvancedCalibrationControls } from "@/features/quick-panel/calibration/advanced/AdvancedCalibrationControls";
import { render, screen } from "@testing-library/react-native";

jest.mock(
  "@/features/quick-panel/calibration/advanced/components/AdvancedGridControls",
  () => ({
    AdvancedGridControls: () => <></>,
  }),
);

jest.mock(
  "@/features/quick-panel/calibration/advanced/components/AdvancedSnapSensitivityControl",
  () => {
    const { View } = jest.requireActual("react-native");
    return {
      AdvancedSnapSensitivityControl: () => (
        <View testID="snap-sensitivity-control-mock" />
      ),
    };
  },
);

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const baseProps = {
  canGoBack: true,
  columns: 4,
  isConfirmPhase: false,
  isGridPhase: false,
  isNextDisabled: false,
  isOuterPhase: false,
  isPanelPhase: true,
  onBack: jest.fn(),
  onColumnsChange: jest.fn(),
  onGridHelpPress: jest.fn(),
  onImport: jest.fn(),
  onNext: jest.fn(),
  onRowsChange: jest.fn(),
  onSave: jest.fn(),
  onSnapSensitivityChange: jest.fn(),
  rows: 5,
  snapSensitivity: "balanced" as const,
};

describe("AdvancedCalibrationControls", () => {
  it("shows snap strength only during panel editing", () => {
    const view = render(
      <AdvancedCalibrationControls {...baseProps} />,
    );
    expect(screen.getByTestId("snap-sensitivity-control-mock")).toBeTruthy();

    view.rerender(
      <AdvancedCalibrationControls
        {...baseProps}
        isPanelPhase={false}
        isConfirmPhase={true}
      />,
    );
    expect(screen.queryByTestId("snap-sensitivity-control-mock")).toBeNull();

    view.rerender(
      <AdvancedCalibrationControls
        {...baseProps}
        isGridPhase={true}
        isPanelPhase={false}
      />,
    );
    expect(screen.queryByTestId("snap-sensitivity-control-mock")).toBeNull();

    view.rerender(
      <AdvancedCalibrationControls
        {...baseProps}
        isPanelPhase={false}
        isOuterPhase={true}
      />,
    );
    expect(screen.queryByTestId("snap-sensitivity-control-mock")).toBeNull();
  });
});
