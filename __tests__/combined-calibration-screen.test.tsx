import { render, screen } from "@testing-library/react-native";
import { CombinedCalibrationScreen } from "@/features/quick-panel/calibration/advanced/combined/CombinedCalibrationScreen";

const mockUseCombinedCalibrationScreen = jest.fn();
const mockAdvancedCalibrationControls = jest.fn((_props: unknown) => null);
const mockAdvancedPanelCanvas = jest.fn((_props: unknown) => null);

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("@/features/quick-panel/calibration/advanced/combined/hooks/useCombinedCalibrationScreen", () => ({
  useCombinedCalibrationScreen: () => mockUseCombinedCalibrationScreen(),
}));

const createScreenState = () => ({
    advancedDraft: null,
    activePanelId: null,
    beginPanelGesture: jest.fn(),
    canGoBack: false,
    closeLeaveDialog: jest.fn(),
    commitPanelGesture: jest.fn(),
    error: null,
    errorKey: null,
    grid: { columns: 4, rows: 5 },
    goBack: jest.fn(),
    goForward: jest.fn(),
    importScreenshot: jest.fn(),
    isButtonSelectionPhase: false,
    isConfirmPhase: false,
    isControlSelectionPhase: false,
    isGridPhase: false,
    isLeaveDialogOpen: false,
    isOuterPhase: true,
    leaveCalibration: jest.fn(),
    panelItems: [],
    panels: null,
    phase: "outer",
    requestLeaveCalibration: jest.fn(),
    saveCalibration: jest.fn(),
    setColumns: jest.fn(),
    setRows: jest.fn(),
    setCombinedEnabledControls: jest.fn(),
    setCombinedButtons: jest.fn(),
    setCombinedOuterRect: jest.fn(),
    isPanelGesturePending: false,
    setSnapSensitivity: jest.fn(),
    snapSensitivity: "balanced" as const,
  });

jest.mock("@/features/quick-panel/shared/QuickPanelScreenShell", () => ({
  QuickPanelScreenShell: ({
    children,
    footer,
  }: { children: React.ReactNode; footer: React.ReactNode }) => <>{footer}{children}</>,
}));

jest.mock("@/features/quick-panel/shared/SubPageHeader", () => ({
  SubPageHeader: ({ title, subtitle }: { title: string; subtitle: string }) => <>{title}{subtitle}</>,
}));

jest.mock("@/features/quick-panel/calibration/advanced/combined/CombinedSelectionStep", () => ({
  CombinedSelectionStep: () => null,
}));

jest.mock("@/features/quick-panel/calibration/advanced/components/AdvancedPanelCanvas", () => ({
  AdvancedPanelCanvas: (props: unknown) => mockAdvancedPanelCanvas(props),
}));

jest.mock("@/features/quick-panel/calibration/advanced/AdvancedCalibrationControls", () => ({
  AdvancedCalibrationControls: (props: unknown) => mockAdvancedCalibrationControls(props),
}));

jest.mock("@/features/quick-panel/calibration/advanced/components/AdvancedCalibrationLeaveDialog", () => ({
  AdvancedCalibrationLeaveDialog: () => null,
}));

jest.mock("@/features/quick-panel/calibration/advanced/AdvancedGridSheet", () => ({
  AdvancedGridSheet: () => null,
}));

jest.mock("@/features/quick-panel/shared/PanelAlignmentHelpSheet", () => ({
  PanelAlignmentHelpSheet: () => null,
}));

jest.mock("@/features/quick-panel/shared/PanelReviewHelpSheet", () => ({
  PanelReviewHelpSheet: () => null,
}));

jest.mock("@/features/quick-panel/calibration/shared/OuterCalibrationStep", () => ({
  OuterCalibrationStep: ({ title, subtitle }: { title: string; subtitle: string }) => {
    const React = jest.requireActual("react");
    const { Text } = jest.requireActual("react-native");
    return React.createElement(React.Fragment, null,
      React.createElement(Text, null, title),
      React.createElement(Text, null, subtitle),
    );
  },
}));

describe("CombinedCalibrationScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCombinedCalibrationScreen.mockReturnValue(createScreenState());
  });

  it("renders the combined calibration title and outer subtitle", () => {
    render(<CombinedCalibrationScreen />);
    expect(screen.getByText("advancedCalibration.title")).toBeTruthy();
    expect(screen.getByText("advancedCalibration.combinedOuterSubtitle")).toBeTruthy();
  });

  it("passes snap sensitivity to the panel footer and canvas", () => {
    const state = {
      ...createScreenState(),
      advancedDraft: {
        buttons: [],
        enabledControls: ["buttonBox" as const],
        outerRect: { height: 400, radius: 0, width: 300, x: 0, y: 0 },
        screenshot: { height: 400, uri: "file:///quick-panel.webp", width: 300 },
      },
      activePanelFamily: "control" as const,
      activePanelId: "buttonBox" as const,
      isOuterPhase: false,
      panelItems: [
        { id: "buttonBox" as const, label: "Button box", family: "control" as const },
      ],
      panels: {
        buttonBox: { height: 100, radius: 0, width: 120, x: 10, y: 20 },
      },
      phase: "buttonBox" as const,
    };
    mockUseCombinedCalibrationScreen.mockReturnValue(state);

    render(<CombinedCalibrationScreen />);

    expect(mockAdvancedCalibrationControls.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        isPanelPhase: true,
        onSnapSensitivityChange: state.setSnapSensitivity,
        snapSensitivity: "balanced",
      }),
    );
    expect(mockAdvancedPanelCanvas.mock.calls[0][0]).toEqual(
      expect.objectContaining({ snapSensitivity: "balanced" }),
    );
  });

  it("hides snap strength during Combined review", () => {
    mockUseCombinedCalibrationScreen.mockReturnValue({
      ...createScreenState(),
      advancedDraft: {
        buttons: [],
        enabledControls: ["buttonBox" as const],
        outerRect: { height: 400, radius: 0, width: 300, x: 0, y: 0 },
        screenshot: { height: 400, uri: "file:///quick-panel.webp", width: 300 },
      },
      isConfirmPhase: true,
      isOuterPhase: false,
      panelItems: [
        { id: "buttonBox" as const, label: "Button box", family: "control" as const },
      ],
      panels: {
        buttonBox: { height: 100, radius: 0, width: 120, x: 10, y: 20 },
      },
      phase: "confirm" as const,
    });

    render(<CombinedCalibrationScreen />);

    expect(mockAdvancedCalibrationControls.mock.calls[0][0]).toEqual(
      expect.objectContaining({ isPanelPhase: false }),
    );
  });
});
