import { createInitialQuickPanelStateData } from "@/features/quick-panel/store/quick-panel-defaults";
import { useQuickPanelStore } from "@/features/quick-panel/store/quick-panel-store";

describe("Quick Panel calibration errors", () => {
  beforeEach(() => {
    useQuickPanelStore.setState(createInitialQuickPanelStateData());
  });

  it("uses Button wording when no Buttons are selected", () => {
    const store = useQuickPanelStore.getState();

    store.selectMode("advanced");
    store.selectAdvancedTarget("buttons");
    store.setAdvancedScreenshot(
      { uri: "file:///screenshot.png", width: 100, height: 100 },
      { x: 0, y: 0, width: 100, height: 100, radius: 0 },
    );
    store.setAdvancedButtons([]);

    expect(useQuickPanelStore.getState().error).toBe(
      "Select at least one Button to continue.",
    );
  });
});
