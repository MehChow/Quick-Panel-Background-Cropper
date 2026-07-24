import { AdvancedPanelBox } from "@/features/quick-panel/calibration/advanced/components/AdvancedPanelBox";
import { act, render } from "@testing-library/react-native";
import type { ReactNode } from "react";

interface MockPanEvent {
  translationX: number;
  translationY: number;
}

interface MockPanHandlers {
  onBegin?: () => void;
  onEnd?: () => void;
  onFinalize?: (event: unknown, success: boolean) => void;
  onUpdate?: (event: MockPanEvent) => void;
}

const mockPanGestures: MockPanHandlers[] = [];

function mockCreatePanGesture() {
  const handlers: MockPanHandlers = {};
  const gesture = {
    onBegin(callback: NonNullable<MockPanHandlers["onBegin"]>) {
      handlers.onBegin = callback;
      return gesture;
    },
    onEnd(callback: NonNullable<MockPanHandlers["onEnd"]>) {
      handlers.onEnd = callback;
      return gesture;
    },
    onFinalize(callback: NonNullable<MockPanHandlers["onFinalize"]>) {
      handlers.onFinalize = callback;
      return gesture;
    },
    onUpdate(callback: NonNullable<MockPanHandlers["onUpdate"]>) {
      handlers.onUpdate = callback;
      return gesture;
    },
  };
  mockPanGestures.push(handlers);
  return gesture;
}

jest.mock("react-native-gesture-handler", () => ({
  Gesture: { Pan: mockCreatePanGesture },
  GestureDetector: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("react-native-worklets", () => ({
  ...jest.requireActual("react-native-worklets/src/mock"),
  scheduleOnRN: (
    callback: (...args: unknown[]) => unknown,
    ...args: unknown[]
  ) => callback(...args),
}));

const baseProps = {
  family: "button" as const,
  grid: { columns: 4, rows: 5 },
  isActive: true,
  isGridEnabled: true,
  label: "button-1" as const,
  labelText: "Wi-Fi",
  outerRect: { x: 0, y: 0, width: 300, height: 400, radius: 0 },
  rect: { x: 50, y: 60, width: 80, height: 100, radius: 0 },
  scale: 1,
};

describe("AdvancedPanelBox gestures", () => {
  beforeEach(() => {
    mockPanGestures.length = 0;
  });

  it("updates the animated draft without committing during move updates", () => {
    const onChange = jest.fn();
    render(<AdvancedPanelBox {...baseProps} onChange={onChange} />);
    const moveHandlers = mockPanGestures[0];

    expect(moveHandlers).toBeDefined();
    act(() => {
      moveHandlers.onBegin?.();
      moveHandlers.onUpdate?.({ translationX: 12, translationY: 8 });
      moveHandlers.onUpdate?.({ translationX: 24, translationY: 16 });
    });
    expect(onChange).not.toHaveBeenCalled();

    act(() => moveHandlers.onEnd?.());
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("commits the last valid resize rectangle when cancelled", () => {
    const onChange = jest.fn();
    render(<AdvancedPanelBox {...baseProps} onChange={onChange} />);
    const bottomRightHandlers = mockPanGestures[7];

    expect(bottomRightHandlers).toBeDefined();
    act(() => {
      bottomRightHandlers.onBegin?.();
      bottomRightHandlers.onUpdate?.({ translationX: 20, translationY: 20 });
      bottomRightHandlers.onFinalize?.({}, false);
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ width: 95.5, height: 104.80000000000001 }),
    );
  });

  it("does not commit twice when a successful gesture finalizes", () => {
    const onChange = jest.fn();
    render(<AdvancedPanelBox {...baseProps} onChange={onChange} />);
    const moveHandlers = mockPanGestures[0];

    act(() => {
      moveHandlers.onBegin?.();
      moveHandlers.onUpdate?.({ translationX: 24, translationY: 16 });
      moveHandlers.onEnd?.();
      moveHandlers.onFinalize?.({}, true);
    });

    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
