import { act, renderHook } from "@testing-library/react-native";
import {
  useAdvancedPanelCommitGate,
  type AdvancedPanelCommitGate,
} from "@/features/quick-panel/calibration/advanced/hooks/useAdvancedPanelCommitGate";
import type { PanelId, PanelRect } from "@/features/quick-panel/model/types";

const finalRect = { x: 20, y: 30, width: 80, height: 90, radius: 0 };
const staleRect = { x: 200, y: 300, width: 40, height: 50, radius: 0 };

function renderGate(commitPanel: (id: PanelId, rect: PanelRect) => void) {
  return renderHook<AdvancedPanelCommitGate, { activePanelId: PanelId | null }>(
    ({ activePanelId }) => useAdvancedPanelCommitGate(activePanelId, commitPanel),
    { initialProps: { activePanelId: "buttonBox" } },
  );
}

describe("advanced panel commit gate", () => {
  it("blocks until the matching commit", () => {
    const commitPanel = jest.fn();
    const hook = renderGate(commitPanel);

    act(() => hook.result.current.beginPanelGesture("buttonBox", 1));
    expect(hook.result.current.isPanelGesturePending).toBe(true);

    act(() => hook.result.current.commitPanelGesture("buttonBox", 1, finalRect));
    expect(commitPanel).toHaveBeenCalledWith("buttonBox", finalRect);
    expect(hook.result.current.isPanelGesturePending).toBe(false);
  });

  it("ignores an older commit without clearing the newer transaction", () => {
    const commitPanel = jest.fn();
    const hook = renderGate(commitPanel);

    act(() => hook.result.current.beginPanelGesture("buttonBox", 1));
    act(() => hook.result.current.beginPanelGesture("buttonBox", 2));
    act(() => hook.result.current.commitPanelGesture("buttonBox", 1, staleRect));

    expect(commitPanel).not.toHaveBeenCalled();
    expect(hook.result.current.isPanelGesturePending).toBe(true);
  });

  it("clears a pending transaction when the active panel changes", () => {
    const commitPanel = jest.fn();
    const hook = renderGate(commitPanel);

    act(() => hook.result.current.beginPanelGesture("buttonBox", 1));
    hook.rerender({ activePanelId: "brightness" as const });

    expect(hook.result.current.isPanelGesturePending).toBe(false);
    act(() => hook.result.current.commitPanelGesture("buttonBox", 1, staleRect));
    expect(commitPanel).not.toHaveBeenCalled();
  });

  it("ignores a begin callback after its panel was completed", () => {
    const commitPanel = jest.fn();
    const hook = renderGate(commitPanel);

    hook.rerender({ activePanelId: null });
    act(() => hook.result.current.beginPanelGesture("buttonBox", 2));

    expect(hook.result.current.isPanelGesturePending).toBe(false);
  });
});
