import { act, fireEvent, render, renderHook, screen } from "@testing-library/react-native";
import { LandingScreen } from "@/features/quick-panel/home/LandingScreen";
import { useCalibrationScreen } from "@/features/quick-panel/calibration/hooks/useCalibrationScreen";
import { useQuickPanelStore } from "@/features/quick-panel/store/quick-panel-store";
import { createInitialQuickPanelStateData } from "@/features/quick-panel/store/quick-panel-defaults";
import type { CustomPanelsCalibrationProfile } from "@/features/quick-panel/model/calibration-profile";

const mockRouter = {
  back: jest.fn(),
  dismissTo: jest.fn(),
  navigate: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
};

jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
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

jest.mock("@/features/quick-panel/home/components/LandingExampleCard", () => ({
  LandingExampleCard: () => null,
}));

jest.mock("@/features/quick-panel/home/hooks/useLandingLayout", () => ({
  useLandingLayout: () => ({
    cardHeight: 0,
    handleActionsLayout: jest.fn(),
    handleContainerLayout: jest.fn(),
  }),
}));

jest.mock("@/features/quick-panel/shared/AppHeader", () => ({
  AppHeader: () => null,
}));

const validCustomProfile: CustomPanelsCalibrationProfile = {
  mode: "custom-panels",
  panels: {
    brightness: {
      id: "brightness",
      rect: { height: 100, radius: 0, width: 200, x: 0, y: 120 },
      status: "present",
    },
    buttonBox: {
      id: "buttonBox",
      rect: { height: 100, radius: 0, width: 200, x: 0, y: 0 },
      status: "present",
    },
    mediaPlayer: { id: "mediaPlayer", rect: null, status: "hidden" },
    volume: { id: "volume", rect: null, status: "hidden" },
  },
  version: 1,
};

function resetQuickPanelStore() {
  useQuickPanelStore.setState(createInitialQuickPanelStateData());
}

describe("calibration navigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetQuickPanelStore();
  });

  it("reuses the landing route when opening calibration", () => {
    render(<LandingScreen />);

    fireEvent.press(screen.getByText("landing.calibration"));

    expect(mockRouter.navigate).toHaveBeenCalledWith("/calibration");
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("reuses the landing route when opening customize", () => {
    useQuickPanelStore.setState({ isCalibrated: true });

    render(<LandingScreen />);

    fireEvent.press(screen.getByText("landing.startCustomizing"));

    expect(mockRouter.navigate).toHaveBeenCalledWith("/customize");
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("dismisses default calibration back to landing after save", () => {
    useQuickPanelStore.setState({
      calibrationRect: { height: 400, radius: 0, width: 300, x: 20, y: 40 },
      screenshot: {
        height: 1200,
        uri: "file:///top.png",
        width: 1080,
      },
    });

    const { result } = renderHook(() => useCalibrationScreen());

    act(() => {
      result.current.saveCalibration();
    });

    expect(mockRouter.dismissTo).toHaveBeenCalledWith("/");
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("dismisses custom calibration back to landing after save", () => {
    useQuickPanelStore.setState({
      calibrationMode: "custom-panels",
      customCalibrationDraft: validCustomProfile,
    });

    const { result } = renderHook(() => useCalibrationScreen());

    act(() => {
      result.current.saveCalibration();
    });

    expect(mockRouter.dismissTo).toHaveBeenCalledWith("/");
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});
