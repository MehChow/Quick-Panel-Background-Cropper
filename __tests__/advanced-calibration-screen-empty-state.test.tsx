import { render, screen } from "@testing-library/react-native";
import { AdvancedCalibrationScreen } from "@/features/quick-panel/calibration/advanced/AdvancedCalibrationScreen";

const mockUseAdvancedCalibrationScreen = jest.fn();
const mockAdvancedCalibrationControls = jest.fn((_props: unknown) => null);
const mockAdvancedPanelCanvas = jest.fn((_props: unknown) => null);

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("@/features/quick-panel/shared/SubPageHeader", () => ({
  SubPageHeader: ({ title, subtitle }: { title: string; subtitle: string }) => {
    const React = jest.requireActual("react");
    const { Text } = jest.requireActual("react-native");
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(Text, null, title),
      React.createElement(Text, null, subtitle),
    );
  },
}));

jest.mock("@/features/quick-panel/shared/CalibrationHelpSheet", () => ({
  CalibrationHelpSheet: () => null,
}));

jest.mock("@/features/quick-panel/shared/PanelAlignmentHelpSheet", () => ({
  PanelAlignmentHelpSheet: () => null,
}));

jest.mock("@/features/quick-panel/shared/PanelReviewHelpSheet", () => ({
  PanelReviewHelpSheet: () => null,
}));

jest.mock("@/features/quick-panel/calibration/advanced/AdvancedGridSheet", () => ({
  AdvancedGridSheet: () => null,
}));

jest.mock("@/features/quick-panel/calibration/advanced/components/AdvancedPanelCanvas", () => ({
  AdvancedPanelCanvas: (props: unknown) => mockAdvancedPanelCanvas(props),
}));

jest.mock("@/features/quick-panel/calibration/advanced/components/AdvancedPanelSelection", () => ({
  AdvancedPanelSelection: () => null,
}));

jest.mock("@/features/quick-panel/calibration/advanced/components/ButtonPanelSelection", () => ({
  ButtonPanelSelection: () => null,
}));

jest.mock("@/features/quick-panel/calibration/advanced/components/AdvancedCalibrationLeaveDialog", () => ({
  AdvancedCalibrationLeaveDialog: () => null,
}));

jest.mock("@/features/quick-panel/calibration/advanced/AdvancedCalibrationControls", () => ({
  AdvancedCalibrationControls: (props: unknown) =>
    mockAdvancedCalibrationControls(props),
}));

jest.mock("@/features/quick-panel/calibration/shared/CalibrationCanvas", () => ({
  CalibrationCanvas: ({
    showImportButton,
  }: {
    showImportButton?: boolean;
  }) => {
    const React = jest.requireActual("react");
    const { Text } = jest.requireActual("react-native");
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(Text, null, `import:${String(showImportButton)}`),
    );
  },
}));

jest.mock("@/features/quick-panel/calibration/advanced/hooks/useAdvancedCalibrationScreen", () => ({
  useAdvancedCalibrationScreen: () => mockUseAdvancedCalibrationScreen(),
}));

function createScreenState() {
  return {
    advancedDraft: null,
    buttons: [],
    canGoBack: false,
    closeLeaveDialog: jest.fn(),
    controlEnabledPanels: [],
    enabledPanels: [],
    error: null,
    errorKey: null,
    goBack: jest.fn(),
    goForward: jest.fn(),
    grid: { columns: 4, rows: 5 },
    importScreenshot: jest.fn(),
    isConfirmPhase: false,
    isGridPhase: false,
    isGridEnabled: false,
    isLeaveDialogOpen: false,
    isOuterPhase: true,
    isPanelSelectionPhase: false,
    leaveCalibration: jest.fn(),
    panelItems: [],
    panels: null,
    phase: "outer",
    requestLeaveCalibration: jest.fn(),
    saveCalibration: jest.fn(),
    setAdvancedEnabledPanels: jest.fn(),
    setAdvancedButtons: jest.fn(),
    setAdvancedOuterRect: jest.fn(),
    setAdvancedPanels: jest.fn(),
    setColumns: jest.fn(),
    setIsGridEnabled: jest.fn(),
    setRows: jest.fn(),
    selectedAdvancedTarget: "controls",
  };
}

describe("AdvancedCalibrationScreen empty state", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAdvancedCalibrationScreen.mockReturnValue(createScreenState());
  });

  it("renders the import footer without showing the canvas import button", () => {
    render(<AdvancedCalibrationScreen />);

    expect(screen.getByText("import:false")).toBeTruthy();
    expect(screen.getByTestId("advanced-calibration-footer")).toBeTruthy();
    expect(screen.getByText("calibration.chooseFromAlbum")).toBeTruthy();
  });

  it("uses Buttons-specific guidance during Button selection", () => {
    mockUseAdvancedCalibrationScreen.mockReturnValue({
      ...createScreenState(),
      advancedDraft: {
        outerRect: { height: 400, radius: 0, width: 800, x: 100, y: 200 },
        screenshot: {
          height: 2340,
          uri: "file:///quick-panel.webp",
          width: 1080,
        },
      },
      isOuterPhase: false,
      isPanelSelectionPhase: true,
      phase: "panelSelection",
      selectedAdvancedTarget: "buttons",
    });

    render(<AdvancedCalibrationScreen />);

    expect(
      screen.getByText("advancedCalibration.buttonSelectionSubtitle"),
    ).toBeTruthy();
  });

  it("passes the snapping preference to the panel canvas", () => {
    mockUseAdvancedCalibrationScreen.mockReturnValue({
      ...createScreenState(),
      advancedDraft: {
        outerRect: { height: 400, radius: 0, width: 300, x: 0, y: 0 },
        screenshot: {
          height: 400,
          uri: "file:///quick-panel.webp",
          width: 300,
        },
      },
      isOuterPhase: false,
      panelItems: [
        { id: "buttonBox", label: "Button box", family: "control" },
      ],
      panels: {
        buttonBox: { height: 100, radius: 0, width: 120, x: 10, y: 20 },
      },
      phase: "buttonBox",
    });

    render(<AdvancedCalibrationScreen />);

    expect(mockAdvancedPanelCanvas.mock.calls[0][0]).toEqual(
      expect.objectContaining({ isGridEnabled: false }),
    );
  });

  it("passes the snapping preference and handler to grid controls", () => {
    const screenState = {
      ...createScreenState(),
      advancedDraft: {
        outerRect: { height: 400, radius: 0, width: 300, x: 0, y: 0 },
        screenshot: {
          height: 400,
          uri: "file:///quick-panel.webp",
          width: 300,
        },
      },
      isGridPhase: true,
      isOuterPhase: false,
      panelItems: [],
      panels: {},
      phase: "grid",
    };
    mockUseAdvancedCalibrationScreen.mockReturnValue(screenState);

    render(<AdvancedCalibrationScreen />);

    expect(mockAdvancedCalibrationControls.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        isGridEnabled: false,
        onGridEnabledChange: screenState.setIsGridEnabled,
      }),
    );
  });
});
