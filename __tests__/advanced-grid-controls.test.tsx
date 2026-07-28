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
  onColumnsChange: jest.fn(),
  onGridHelpPress: jest.fn(),
  onRowsChange: jest.fn(),
  rows: 5,
};

describe("AdvancedGridControls", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("keeps the grid controls and help available without a toggle", () => {
    render(<AdvancedGridControls {...baseProps} />);

    expect(screen.queryByTestId("advanced-grid-toggle")).toBeNull();
    expect(screen.getByTestId("advanced-grid-columns-chip").props.disabled)
      .toBeFalsy();
    expect(screen.getByTestId("advanced-grid-rows-chip").props.disabled)
      .toBeFalsy();
    expect(screen.getByTestId("advanced-grid-slider").props.disabled)
      .toBeFalsy();
    expect(screen.getByTestId("advanced-grid-help")).toBeTruthy();
  });

  it("changes the active grid axis and forwards slider values", () => {
    render(<AdvancedGridControls {...baseProps} />);

    fireEvent.press(screen.getByTestId("advanced-grid-rows-chip"));
    fireEvent(
      screen.getByTestId("advanced-grid-slider"),
      "valueChange",
      6,
    );

    expect(baseProps.onRowsChange).toHaveBeenCalledWith(6);
    expect(baseProps.onColumnsChange).not.toHaveBeenCalled();
  });
});
