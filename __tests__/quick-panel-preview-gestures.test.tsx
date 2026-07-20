import { useQuickPanelPreviewGestures } from "@/features/quick-panel/customize/hooks/useQuickPanelPreviewGestures";
import type { QuickPanelPreset } from "@/features/quick-panel/model/types";
import { act, renderHook } from "@testing-library/react-native";

interface MockPanEvent {
  changeX: number;
  changeY: number;
  translationX: number;
  translationY: number;
}

interface MockPinchEvent {
  focalX: number;
  focalY: number;
  scale: number;
}

interface MockTouchEvent {
  numberOfTouches: number;
}

interface MockGestureHandlers<Event> {
  onBegin?: () => void;
  onChange?: (event: Event) => void;
  onEnd?: () => void;
  onFinalize?: () => void;
  onStart?: (event: Event) => void;
  onTouchesDown?: (event: MockTouchEvent) => void;
  onTouchesUp?: (event: MockTouchEvent) => void;
  onUpdate?: (event: Event) => void;
}

const mockPanHandlers: MockGestureHandlers<MockPanEvent>[] = [];
const mockPinchHandlers: MockGestureHandlers<MockPinchEvent>[] = [];

function mockCreateGesture<Event>(
  handlersList: MockGestureHandlers<Event>[],
) {
  const handlers: MockGestureHandlers<Event> = {};
  const gesture = {
    onBegin(callback: NonNullable<MockGestureHandlers<Event>["onBegin"]>) {
      handlers.onBegin = callback;
      return gesture;
    },
    onChange(callback: NonNullable<MockGestureHandlers<Event>["onChange"]>) {
      handlers.onChange = callback;
      return gesture;
    },
    onEnd(callback: NonNullable<MockGestureHandlers<Event>["onEnd"]>) {
      handlers.onEnd = callback;
      return gesture;
    },
    onFinalize(
      callback: NonNullable<MockGestureHandlers<Event>["onFinalize"]>,
    ) {
      handlers.onFinalize = callback;
      return gesture;
    },
    onStart(callback: NonNullable<MockGestureHandlers<Event>["onStart"]>) {
      handlers.onStart = callback;
      return gesture;
    },
    onTouchesDown(
      callback: NonNullable<MockGestureHandlers<Event>["onTouchesDown"]>,
    ) {
      handlers.onTouchesDown = callback;
      return gesture;
    },
    onTouchesUp(
      callback: NonNullable<MockGestureHandlers<Event>["onTouchesUp"]>,
    ) {
      handlers.onTouchesUp = callback;
      return gesture;
    },
    onUpdate(callback: NonNullable<MockGestureHandlers<Event>["onUpdate"]>) {
      handlers.onUpdate = callback;
      return gesture;
    },
  };
  handlersList.push(handlers);
  return gesture;
}

jest.mock("react-native-gesture-handler", () => ({
  Gesture: {
    Pan: () => mockCreateGesture(mockPanHandlers),
    Pinch: () => mockCreateGesture(mockPinchHandlers),
    Simultaneous: (...gestures: unknown[]) => gestures,
  },
}));

jest.mock("react-native-worklets", () => ({
  ...jest.requireActual("react-native-worklets/src/mock"),
  scheduleOnRN: (
    callback: (...args: unknown[]) => unknown,
    ...args: unknown[]
  ) => callback(...args),
}));

const preset: QuickPanelPreset = {
  customizationArea: { height: 300, radius: 0, width: 300, x: 0, y: 0 },
  goodLockOrder: [],
  height: 300,
  id: "gesture-test",
  label: "Gesture test",
  mode: "default",
  panels: {},
  visualOrder: [],
  width: 300,
};

const initialTransform = { scale: 1, x: -100, y: -120 };
const image = { height: 1000, uri: "file:///image.png", width: 1000 };

interface PreviewFrameProps {
  previewFrame: QuickPanelPreset["customizationArea"];
}

describe("Customize preview gestures", () => {
  beforeEach(() => {
    mockPanHandlers.length = 0;
    mockPinchHandlers.length = 0;
  });

  it("does not restore stale pan position when pinch activates at scale one", () => {
    const hook = renderHook(() =>
      useQuickPanelPreviewGestures({
        image,
        onAdjustingChange: jest.fn(),
        onTransformChange: jest.fn(),
        preset,
        previewFrame: preset.customizationArea,
        transform: initialTransform,
      }),
    );
    const pan = mockPanHandlers[0];
    const pinch = mockPinchHandlers[0];

    act(() => {
      pan.onBegin?.();
      pinch.onBegin?.();
      pan.onChange?.({
        changeX: 30,
        changeY: 20,
        translationX: 30,
        translationY: 20,
      });
      pinch.onStart?.({ focalX: 100, focalY: 120, scale: 1 });
      pinch.onUpdate?.({ focalX: 100, focalY: 120, scale: 1 });
    });

    expect(hook.result.current.sharedTransform.get()).toEqual({
      scale: 1,
      x: -70,
      y: -100,
    });
  });

  it("translates continuously when two fingers move without changing scale", () => {
    const hook = renderHook(() =>
      useQuickPanelPreviewGestures({
        image,
        onAdjustingChange: jest.fn(),
        onTransformChange: jest.fn(),
        preset,
        previewFrame: preset.customizationArea,
        transform: initialTransform,
      }),
    );
    const pinch = mockPinchHandlers[0];

    act(() => {
      pinch.onBegin?.();
      pinch.onStart?.({ focalX: 100, focalY: 120, scale: 1 });
      pinch.onUpdate?.({ focalX: 125, focalY: 105, scale: 1 });
    });

    expect(hook.result.current.sharedTransform.get()).toEqual({
      scale: 1,
      x: -75,
      y: -135,
    });
  });

  it("keeps the starting focal point anchored while zooming", () => {
    const hook = renderHook(() =>
      useQuickPanelPreviewGestures({
        image,
        onAdjustingChange: jest.fn(),
        onTransformChange: jest.fn(),
        preset,
        previewFrame: preset.customizationArea,
        transform: initialTransform,
      }),
    );
    const pinch = mockPinchHandlers[0];

    act(() => {
      pinch.onBegin?.();
      pinch.onStart?.({ focalX: 100, focalY: 120, scale: 1 });
      pinch.onUpdate?.({ focalX: 100, focalY: 120, scale: 2 });
    });

    expect(hook.result.current.sharedTransform.get()).toEqual({
      scale: 2,
      x: -300,
      y: -360,
    });
  });

  it("lets pinch own updates and resumes pan from the current transform", () => {
    const hook = renderHook(() =>
      useQuickPanelPreviewGestures({
        image,
        onAdjustingChange: jest.fn(),
        onTransformChange: jest.fn(),
        preset,
        previewFrame: preset.customizationArea,
        transform: initialTransform,
      }),
    );
    const pan = mockPanHandlers[0];
    const pinch = mockPinchHandlers[0];

    act(() => {
      pan.onBegin?.();
      pinch.onBegin?.();
      pan.onChange?.({
        changeX: 30,
        changeY: 20,
        translationX: 30,
        translationY: 20,
      });
      pinch.onStart?.({ focalX: 100, focalY: 120, scale: 1 });
      pinch.onUpdate?.({ focalX: 100, focalY: 120, scale: 1 });
      pan.onChange?.({
        changeX: 200,
        changeY: 200,
        translationX: 230,
        translationY: 220,
      });
    });
    expect(hook.result.current.sharedTransform.get()).toEqual({
      scale: 1,
      x: -70,
      y: -100,
    });

    act(() => {
      pinch.onFinalize?.();
      pan.onChange?.({
        changeX: 5,
        changeY: -10,
        translationX: 235,
        translationY: 210,
      });
    });
    expect(hook.result.current.sharedTransform.get()).toEqual({
      scale: 1,
      x: -65,
      y: -110,
    });
  });

  it("ignores the trailing pinch update when one pointer lifts", () => {
    const hook = renderHook(() =>
      useQuickPanelPreviewGestures({
        image,
        onAdjustingChange: jest.fn(),
        onTransformChange: jest.fn(),
        preset,
        previewFrame: preset.customizationArea,
        transform: initialTransform,
      }),
    );
    const pan = mockPanHandlers[0];
    const pinch = mockPinchHandlers[0];

    act(() => {
      pan.onBegin?.();
      pinch.onBegin?.();
      pinch.onStart?.({ focalX: 100, focalY: 120, scale: 1 });
      pinch.onUpdate?.({ focalX: 100, focalY: 120, scale: 2 });
    });
    const transformBeforePointerLift = hook.result.current.sharedTransform.get();

    act(() => {
      pinch.onTouchesUp?.({ numberOfTouches: 1 });
      pinch.onUpdate?.({ focalX: 180, focalY: 200, scale: 2 });
    });

    expect(hook.result.current.sharedTransform.get()).toEqual(
      transformBeforePointerLift,
    );

    act(() => {
      pan.onChange?.({
        changeX: 5,
        changeY: -10,
        translationX: 5,
        translationY: -10,
      });
    });

    expect(hook.result.current.sharedTransform.get()).toEqual({
      scale: 2,
      x: transformBeforePointerLift.x + 5,
      y: transformBeforePointerLift.y - 10,
    });
  });

  it("rebases pinch when a second pointer returns", () => {
    const hook = renderHook(() =>
      useQuickPanelPreviewGestures({
        image,
        onAdjustingChange: jest.fn(),
        onTransformChange: jest.fn(),
        preset,
        previewFrame: preset.customizationArea,
        transform: initialTransform,
      }),
    );
    const pinch = mockPinchHandlers[0];

    act(() => {
      pinch.onBegin?.();
      pinch.onStart?.({ focalX: 100, focalY: 120, scale: 1 });
      pinch.onUpdate?.({ focalX: 100, focalY: 120, scale: 2 });
      pinch.onTouchesUp?.({ numberOfTouches: 1 });
      pinch.onUpdate?.({ focalX: 180, focalY: 200, scale: 2 });
      pinch.onTouchesDown?.({ numberOfTouches: 2 });
      pinch.onUpdate?.({ focalX: 140, focalY: 150, scale: 2 });
    });

    expect(hook.result.current.sharedTransform.get()).toEqual({
      scale: 2,
      x: -300,
      y: -360,
    });

    act(() => {
      pinch.onUpdate?.({ focalX: 140, focalY: 150, scale: 2.25 });
    });

    expect(hook.result.current.sharedTransform.get()).toEqual({
      scale: 2.25,
      x: -355,
      y: -423.75,
    });
  });

  it("changes presentation frames without committing a new transform", () => {
    const onTransformChange = jest.fn();
    const sourceFrame = {
      x: 0,
      y: -100,
      width: 300,
      height: 500,
      radius: 0,
    };
    const hook = renderHook(
      ({ previewFrame }: PreviewFrameProps) =>
        useQuickPanelPreviewGestures({
          image,
          onAdjustingChange: jest.fn(),
          onTransformChange,
          preset,
          previewFrame,
          transform: initialTransform,
        }),
      {
        initialProps: { previewFrame: preset.customizationArea },
      },
    );

    hook.rerender({ previewFrame: sourceFrame });

    expect(hook.result.current.sharedTransform.get()).toEqual(initialTransform);
    expect(onTransformChange).not.toHaveBeenCalled();
  });
});
