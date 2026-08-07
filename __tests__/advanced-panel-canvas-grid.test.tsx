import { render } from "@testing-library/react-native";
import { AdvancedPanelCanvas } from "@/features/quick-panel/calibration/advanced/components/AdvancedPanelCanvas";

const mockAdvancedPanelBox = jest.fn((_props: unknown) => null);
const mockAdvancedSnapGridOverlay = jest.fn((_props: unknown) => null);

jest.mock("expo-image", () => ({
  Image: () => null,
}));

jest.mock(
  "@/features/quick-panel/calibration/advanced/components/AdvancedPanelBox",
  () => ({
    AdvancedPanelBox: (props: unknown) => mockAdvancedPanelBox(props),
  }),
);

jest.mock(
  "@/features/quick-panel/calibration/advanced/components/AdvancedSnapGridOverlay",
  () => ({
    AdvancedSnapGridOverlay: (props: unknown) =>
      mockAdvancedSnapGridOverlay(props),
  }),
);

const outerRect = { x: 0, y: 0, width: 300, height: 400, radius: 0 };
const props = {
  grid: { columns: 4, rows: 5 },
  panelItems: [
    { id: "buttonBox" as const, label: "Button box", family: "control" as const },
  ],
  outerRect,
  phase: "buttonBox" as const,
  panels: {
    buttonBox: { x: 10, y: 20, width: 120, height: 100, radius: 0 },
  },
  screenshot: { uri: "file:///quick-panel.png", width: 300, height: 400 },
  snapSensitivity: "strong" as const,
  onPanelsChange: jest.fn(),
};

describe("AdvancedPanelCanvas snapping grid", () => {
  beforeEach(() => {
    mockAdvancedPanelBox.mockClear();
    mockAdvancedSnapGridOverlay.mockClear();
  });

  it("always shows the overlay and gives panel boxes the grid", () => {
    render(<AdvancedPanelCanvas {...props} />);

    expect(mockAdvancedSnapGridOverlay).toHaveBeenCalledTimes(1);
    expect(mockAdvancedPanelBox).toHaveBeenCalledWith(
      expect.objectContaining({
        grid: props.grid,
        snapSensitivity: "strong",
      }),
    );
    expect(mockAdvancedPanelBox.mock.calls[0][0]).not.toHaveProperty(
      "isGridEnabled",
    );
  });

  it("hides the overlay only during confirmation", () => {
    render(<AdvancedPanelCanvas {...props} phase="confirm" />);

    expect(mockAdvancedSnapGridOverlay).not.toHaveBeenCalled();
  });
});
