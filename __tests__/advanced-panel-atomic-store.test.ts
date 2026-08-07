import { createInitialQuickPanelStateData } from "@/features/quick-panel/store/quick-panel-defaults";
import { useQuickPanelStore } from "@/features/quick-panel/store/quick-panel-store";

const screenshot = {
  uri: "file:///quick-panel.png",
  width: 300,
  height: 400,
};

const outerRect = { x: 0, y: 0, width: 300, height: 400, radius: 0 };

function rect(x: number, y: number, width: number, height: number) {
  return { x, y, width, height, radius: 0 };
}

describe("advanced calibration atomic panel writes", () => {
  beforeEach(() => {
    useQuickPanelStore.setState(createInitialQuickPanelStateData());
  });

  it("changes only the requested Controls-only panel", () => {
    const originalButtonBox = rect(0, 0, 80, 80);
    const originalBrightness = rect(0, 100, 80, 40);
    useQuickPanelStore.setState({
      ...createInitialQuickPanelStateData(),
      selectedMode: "advanced",
      selectedAdvancedTarget: "controls",
      advancedDraft: {
        screenshot,
        outerRect,
        enabledPanels: ["buttonBox", "brightness"],
        panels: {
          buttonBox: originalButtonBox,
          brightness: originalBrightness,
          volume: rect(0, 150, 80, 40),
          mediaPlayer: rect(0, 200, 80, 40),
        },
      },
    });

    useQuickPanelStore.getState().setAdvancedPanel(
      "brightness",
      rect(100, 100, 80, 40),
    );

    const panels = useQuickPanelStore.getState().advancedDraft?.panels;
    expect(panels?.buttonBox).toEqual(originalButtonBox);
    expect(panels?.brightness).toEqual(rect(100, 100, 80, 40));
  });

  it("changes only the requested Buttons-only panel", () => {
    const buttonOne = {
      id: "button-1" as const,
      label: "Wi-Fi",
      customIconId: null,
      rect: rect(0, 0, 80, 80),
    };
    const buttonTwo = {
      id: "button-2" as const,
      label: "Bluetooth",
      customIconId: null,
      rect: rect(0, 100, 80, 80),
    };
    useQuickPanelStore.setState({
      ...createInitialQuickPanelStateData(),
      selectedMode: "advanced",
      selectedAdvancedTarget: "buttons",
      advancedButtonsDraft: { screenshot, outerRect, buttons: [buttonOne, buttonTwo] },
    });

    useQuickPanelStore.getState().setAdvancedButtonPanel(
      "button-2",
      rect(100, 100, 80, 80),
    );

    const buttons = useQuickPanelStore.getState().advancedButtonsDraft?.buttons;
    expect(buttons?.[0]).toEqual(buttonOne);
    expect(buttons?.[1]).toEqual({ ...buttonTwo, rect: rect(100, 100, 80, 80) });
  });

  it("changes only the requested Combined panel", () => {
    const originalButtonBox = rect(0, 0, 80, 80);
    const originalBrightness = rect(0, 100, 80, 40);
    const buttonOne = {
      id: "button-1" as const,
      label: "Wi-Fi",
      customIconId: null,
      rect: rect(0, 150, 80, 80),
    };
    const buttonTwo = {
      id: "button-2" as const,
      label: "Bluetooth",
      customIconId: null,
      rect: rect(100, 150, 80, 80),
    };
    useQuickPanelStore.setState({
      ...createInitialQuickPanelStateData(),
      selectedMode: "advanced",
      selectedAdvancedTarget: "combined",
      advancedCombinedDraft: {
        screenshot,
        outerRect,
        enabledControls: ["buttonBox", "brightness"],
        controlPanels: {
          buttonBox: originalButtonBox,
          brightness: originalBrightness,
          volume: rect(0, 250, 80, 40),
          mediaPlayer: rect(0, 300, 80, 40),
        },
        buttons: [buttonOne, buttonTwo],
      },
    });

    useQuickPanelStore.getState().setCombinedPanel(
      "button-2",
      rect(200, 150, 80, 80),
    );

    const draft = useQuickPanelStore.getState().advancedCombinedDraft;
    expect(draft?.controlPanels?.buttonBox).toEqual(originalButtonBox);
    expect(draft?.controlPanels?.brightness).toEqual(originalBrightness);
    expect(draft?.buttons[0]).toEqual(buttonOne);
    expect(draft?.buttons[1]).toEqual({
      ...buttonTwo,
      rect: rect(200, 150, 80, 80),
    });
  });
});
