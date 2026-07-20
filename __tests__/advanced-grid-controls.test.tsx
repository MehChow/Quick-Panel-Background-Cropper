import { AdvancedGridControls } from "@/features/quick-panel/calibration/advanced/components/AdvancedGridControls";
import { fireEvent, render, screen } from "@testing-library/react-native";

jest.mock("@/components/ani-ui/slider", () => {
  const React = jest.requireActual("react");
  const { View } = jest.requireActual("react-native");
  return {
    Slider: (props: Record<string, unknown>) => React.createElement(View, props),
  };
});

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    i18n: { resolvedLanguage: "en" },
    t: (key: string) => key,
  }),
}));

const baseProps = {
  columns: 4,
  isGridEnabled: false,
  onColumnsChange: jest.fn(),
  onGridEnabledChange: jest.fn(),
  onGridHelpPress: jest.fn(),
  onRowsChange: jest.fn(),
  rows: 5,
};

describe("AdvancedGridControls", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("keeps help available while disabling grid dimensions", () => {
    render(<AdvancedGridControls {...baseProps} />);

    expect(
      screen.getByTestId("advanced-grid-columns-chip").props.accessibilityState,
    ).toEqual(expect.objectContaining({ disabled: true }));
    expect(
      screen.getByTestId("advanced-grid-rows-chip").props.accessibilityState,
    ).toEqual(expect.objectContaining({ disabled: true }));
    expect(screen.getByTestId("advanced-grid-slider").props.accessibilityState)
      .toEqual(expect.objectContaining({ disabled: true }));
    expect(
      screen.getByLabelText("advancedCalibration.gridHelpButton"),
    ).toBeTruthy();
  });

  it("requests enabling from the accessible switch", () => {
    render(<AdvancedGridControls {...baseProps} />);

    const toggle = screen.getByTestId("advanced-grid-toggle");
    expect(toggle.props.accessibilityLabel).toBe(
      "advancedCalibration.gridToggleLabel",
    );

    fireEvent(toggle, "valueChange", true);

    expect(baseProps.onGridEnabledChange).toHaveBeenCalledWith(true);
  });
});
