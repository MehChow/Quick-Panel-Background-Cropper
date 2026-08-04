import { Slider } from "@/components/ani-ui/slider";
import { act, fireEvent, render } from "@testing-library/react-native";
import type { ReactNode } from "react";

interface PanHandlers {
  onBegin?: (event: { x: number }) => void;
  onFinalize?: () => void;
  onUpdate?: (event: { x: number }) => void;
}

const panHandlers: PanHandlers = {};

jest.mock("react-native-gesture-handler", () => ({
  Gesture: {
    Pan: () => ({
      enabled: () => ({
        onBegin: (callback: (event: { x: number }) => void) => {
          panHandlers.onBegin = callback;
          return {
            onUpdate: (nextCallback: (event: { x: number }) => void) => {
              panHandlers.onUpdate = nextCallback;
              return {
                onFinalize: (finalizeCallback: () => void) => {
                  panHandlers.onFinalize = finalizeCallback;
                  return { minDistance: () => ({}) };
                },
              };
            },
          };
        },
      }),
    }),
  },
  GestureDetector: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("react-native-worklets", () => ({
  ...jest.requireActual("react-native-worklets/src/mock"),
  scheduleOnRN: (callback: (value: number) => void, value: number) =>
    callback(value),
}));

describe("Slider", () => {
  beforeEach(() => {
    delete panHandlers.onBegin;
    delete panHandlers.onFinalize;
    delete panHandlers.onUpdate;
  });

  it("emits each stepped value once and completes with the last value", () => {
    const onValueChange = jest.fn();
    const onSlidingComplete = jest.fn();
    const screen = render(
      <Slider
        max={100}
        min={0}
        onSlidingComplete={onSlidingComplete}
        onValueChange={onValueChange}
        step={1}
        testID="slider"
        value={50}
      />,
    );

    fireEvent(screen.getByTestId("slider"), "layout", {
      nativeEvent: { layout: { height: 32, width: 100, x: 0, y: 0 } },
    });
    act(() => {
      panHandlers.onBegin?.({ x: 10 });
      panHandlers.onUpdate?.({ x: 10.2 });
      panHandlers.onUpdate?.({ x: 11 });
      panHandlers.onUpdate?.({ x: 11.4 });
    });

    expect(onValueChange.mock.calls).toEqual([[10], [11]]);
    expect(onSlidingComplete).not.toHaveBeenCalled();

    act(() => panHandlers.onFinalize?.());
    expect(onSlidingComplete).toHaveBeenCalledTimes(1);
    expect(onSlidingComplete).toHaveBeenCalledWith(11);
  });

  it("does not re-emit the same externally controlled value", () => {
    const onValueChange = jest.fn();
    const screen = render(
      <Slider
        max={100}
        min={0}
        onValueChange={onValueChange}
        step={1}
        testID="slider"
        value={50}
      />,
    );

    fireEvent(screen.getByTestId("slider"), "layout", {
      nativeEvent: { layout: { height: 32, width: 100, x: 0, y: 0 } },
    });
    act(() => panHandlers.onUpdate?.({ x: 10 }));
    screen.rerender(
      <Slider
        max={100}
        min={0}
        onValueChange={onValueChange}
        step={1}
        testID="slider"
        value={10}
      />,
    );
    act(() => panHandlers.onUpdate?.({ x: 10 }));

    expect(onValueChange.mock.calls).toEqual([[10]]);
  });
});
