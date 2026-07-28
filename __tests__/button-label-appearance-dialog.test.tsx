import { ButtonLabelAppearanceDialog } from "@/features/quick-panel/customize/components/ButtonLabelAppearanceDialog";
import { useButtonLabelAppearanceDraft } from "@/features/quick-panel/customize/hooks/useButtonLabelAppearanceDraft";
import { act, fireEvent, render, renderHook } from "@testing-library/react-native";
import { KeyboardAvoidingView, Platform } from "react-native";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => ({
      "common.cancel": "Cancel",
      "common.confirm": "Confirm",
      "customize.invalidButtonIdentifierHex":
        "Enter a valid six-digit HEX color.",
    })[key] ?? key,
  }),
}));
jest.mock("reanimated-color-picker", () => {
  const React = jest.requireActual("react");
  const { View } = jest.requireActual("react-native");
  const pickerValues = {
    alphaValue: { value: 0.7 },
    brightnessValue: { value: 64 },
  };
  const Picker = React.forwardRef(
    (
      props: { children: React.ReactNode },
      ref: React.ForwardedRef<{ setColor: (color: string) => void }>,
    ) => {
      React.useImperativeHandle(ref, () => ({ setColor: jest.fn() }));
      return React.createElement(
        View,
        { ...props, children: undefined, testID: "mock-color-picker" },
        props.children,
      );
    },
  );
  const part = (testID: string) => (props: Record<string, unknown>) =>
    React.createElement(View, { ...props, testID });
  const colorKit = {
    HEX: (value: string) => value.slice(0, 7),
    RGB: (value: string) => ({
      object: () => ({ a: Number(value.split(",").at(-1)?.replace(")", "") ?? 1) }),
    }),
    getAlpha: () => 1,
    runOnUI: () => colorKit,
    setAlpha: (color: string, alpha: number) => ({
      rgb: () => ({ string: () => `rgba(255,255,255,${alpha})` }),
      color,
    }),
  };
  return {
    __esModule: true,
    default: Picker,
    BrightnessSlider: part("mock-brightness"),
    OpacitySlider: part("mock-opacity"),
    Panel3: part("mock-panel"),
    colorKit,
    useColorPickerContext: () => pickerValues,
  };
});
jest.mock(
  "@/features/quick-panel/customize/components/QuickPanelPreview",
  () => {
    const React = jest.requireActual("react");
    const { View } = jest.requireActual("react-native");
    return {
      QuickPanelPreview: (props: Record<string, unknown>) =>
        React.createElement(View, { ...props, testID: "dialog-preview" }),
    };
  },
);

const preset = {
  id: "buttons",
  label: "Buttons",
  mode: "advanced" as const,
  width: 100,
  height: 100,
  customizationArea: { x: 0, y: 0, width: 100, height: 100, radius: 0 },
  panels: {},
  visualOrder: [],
  goodLockOrder: [],
};
const props = {
  backgroundTheme: "light" as const,
  color: "#FFFFFF",
  image: { uri: "file://image", width: 100, height: 100 },
  identifierPositions: { horizontal: 0.5, vertical: 0.5 },
  imageOpacity: 0.78,
  onCancel: jest.fn(),
  onConfirm: jest.fn(),
  opacity: 70,
  open: true,
  preset,
  previewUri: "file://preview",
  showButtonIdentifiers: true,
  transform: { x: 0, y: 0, scale: 1 },
};

describe("ButtonLabelAppearanceDialog", () => {
  beforeEach(() => jest.clearAllMocks());

  it("keeps preview read-only and validates transactional HEX confirmation", () => {
    const screen = render(
      <ButtonLabelAppearanceDialog
        {...props}
        identifierPositions={{ horizontal: 0.23, vertical: 0.77 }}
        imageOpacity={0.42}
      />,
    );
    expect(screen.getByTestId("dialog-preview").props.interactive).toBe(false);
    expect(screen.getByTestId("dialog-preview").props).toMatchObject({
      buttonIdentifierBackgroundTheme: "light",
      buttonPanelOpacity: 0.42,
      identifierPositions: { horizontal: 0.23, vertical: 0.77 },
      showAppGradientBackground: true,
    });
    const input = screen.getByTestId("button-identifier-hex-input");
    fireEvent.changeText(input, "#12");
    expect(screen.getByText("Enter a valid six-digit HEX color.")).toBeTruthy();
    fireEvent.press(screen.getByText("Confirm"));
    expect(props.onConfirm).not.toHaveBeenCalled();
    fireEvent.changeText(input, "336699");
    fireEvent.press(screen.getByText("Confirm"));
    expect(props.onConfirm).toHaveBeenCalledWith({
      backgroundTheme: "light",
      color: "#336699",
      opacity: 70,
    });
  });

  it("updates only the draft circle immediately when its theme changes", () => {
    const hook = renderHook(() =>
      useButtonLabelAppearanceDraft("#123456", 70, "light")
    );

    expect(hook.result.current.backgroundTheme).toBe("light");
    expect(hook.result.current.animatedAppearance.circleColor.value).toBe(
      "#FFFFFF",
    );
    const circleColor = hook.result.current.animatedAppearance.circleColor;

    act(() => hook.result.current.handleBackgroundThemeChange("dark"));

    expect(hook.result.current.backgroundTheme).toBe("dark");
    expect(circleColor.value).toBe("#666666");
    expect(hook.result.current.readConfirmedAppearance()).toEqual({
      backgroundTheme: "dark",
      color: "#123456",
      opacity: 70,
    });
  });

  it("cancels from the action and backdrop without committing", () => {
    const screen = render(<ButtonLabelAppearanceDialog {...props} />);
    fireEvent.press(screen.getByText("Cancel"));
    fireEvent.press(screen.getByTestId("button-label-appearance-backdrop"));
    expect(props.onCancel).toHaveBeenCalledTimes(2);
    expect(props.onConfirm).not.toHaveBeenCalled();
  });

  it("switches one shared slider card without losing picker values", () => {
    const screen = render(<ButtonLabelAppearanceDialog {...props} />);

    expect(screen.getByTestId("mock-brightness")).toBeTruthy();
    expect(screen.queryByTestId("mock-opacity")).toBeNull();
    expect(screen.getByTestId("button-label-adjustment-value").props.animatedProps)
      .toMatchObject({ text: "64%" });

    fireEvent.press(screen.getByTestId("button-label-intensity-tab"));
    expect(screen.queryByTestId("mock-brightness")).toBeNull();
    expect(screen.getByTestId("mock-opacity")).toBeTruthy();
    expect(screen.getByTestId("button-label-adjustment-value").props.animatedProps)
      .toMatchObject({ text: "70%" });

    fireEvent.press(screen.getByTestId("button-label-brightness-tab"));
    expect(screen.getByTestId("mock-brightness")).toBeTruthy();
    expect(screen.queryByTestId("mock-opacity")).toBeNull();
    expect(screen.getByTestId("button-label-adjustment-value").props.animatedProps)
      .toMatchObject({ text: "64%" });
  });

  it("places the theme toggle beside HEX and changes only the draft circle", () => {
    const screen = render(<ButtonLabelAppearanceDialog {...props} />);
    const previewAppearance = screen.getByTestId("dialog-preview").props
      .animatedButtonIdentifierAppearance;
    const initialColor = previewAppearance.color.value;
    const circleColor = previewAppearance.circleColor;
    const row = screen.getByTestId("button-identifier-hex-theme-row");

    expect(row.props.className).toContain("flex-row");
    expect(screen.getByTestId("button-identifier-hex-input").props.className)
      .toContain("flex-1");
    expect(screen.getByTestId("button-identifier-background-theme-toggle").props)
      .toMatchObject({
        accessibilityLabel:
          "customize.buttonIdentifierBackgroundThemeChoice",
      });

    fireEvent.press(
      screen.getByTestId("button-identifier-background-theme-toggle"),
    );

    expect(circleColor.value).toBe("#666666");
    expect(previewAppearance.color.value).toBe(initialColor);
    expect(screen.getByTestId("dialog-preview").props)
      .toMatchObject({ buttonIdentifierBackgroundTheme: "dark" });
    fireEvent.press(screen.getByText("Confirm"));
    expect(props.onConfirm).toHaveBeenCalledWith({
      backgroundTheme: "dark",
      color: "#FFFFFF",
      opacity: 70,
    });
  });

  it("uses compact picker controls and a keyboard-safe announcement surface", () => {
    const screen = render(<ButtonLabelAppearanceDialog {...props} />);

    expect(screen.getByTestId("mock-color-picker").props).toMatchObject({
      sliderThickness: 12,
      thumbSize: 28,
    });
    expect(
      screen.getByTestId("button-label-appearance-keyboard-avoider"),
    ).toBeTruthy();
    expect(screen.getByTestId("button-label-appearance-card").props.className)
      .toContain("border-slate-700");
    expect(screen.getByTestId("button-label-appearance-card").props.className)
      .toContain("bg-slate-950");
    expect(screen.getByTestId("button-label-appearance-cancel").props.className)
      .toContain("bg-white");
    expect(screen.getByText("Cancel").props.className).toContain("text-black");
  });

  it("uses non-sticky Android keyboard padding while the backdrop stays full-screen", () => {
    const originalPlatform = Platform.OS;
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "android",
    });

    try {
      const screen = render(<ButtonLabelAppearanceDialog {...props} />);
      const keyboardAvoider = screen.UNSAFE_getByType(KeyboardAvoidingView);

      expect(keyboardAvoider.props.behavior).toBe("padding");
      expect(
        screen.getByTestId("button-label-appearance-scroll").props
          .automaticallyAdjustKeyboardInsets,
      ).toBeUndefined();
      const backdropAncestorIds: unknown[] = [];
      let ancestor = screen.getByTestId(
        "button-label-appearance-backdrop",
      ).parent;
      while (ancestor) {
        backdropAncestorIds.push(ancestor.props.testID);
        ancestor = ancestor.parent;
      }
      expect(backdropAncestorIds).toContain("button-label-appearance-root");
      expect(backdropAncestorIds).not.toContain(
        "button-label-appearance-keyboard-avoider",
      );
    } finally {
      Object.defineProperty(Platform, "OS", {
        configurable: true,
        value: originalPlatform,
      });
    }
  });
});
