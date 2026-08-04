import { ButtonAppearanceInspectorControls } from "@/features/quick-panel/customize/components/ButtonAppearanceInspectorControls";
import { fireEvent, render } from "@testing-library/react-native";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, string | number>) => {
      const strings: Record<string, string> = {
        "customize.buttonAppearanceNext": "Next Button",
        "customize.buttonAppearancePosition": "{{label}} · {{current}} of {{total}}",
        "customize.buttonAppearancePrevious": "Previous Button",
      };
      return (strings[key] ?? key).replace(/\{\{(\w+)\}\}/g, (_, name) =>
        String(values?.[name] ?? `{{${name}}}`),
      );
    },
  }),
}));

jest.mock("@react-native-vector-icons/lucide", () => ({
  Lucide: () => null,
}));

describe("ButtonAppearanceInspectorControls", () => {
  it("overlays navigation arrows without a position label", () => {
    const props = {
      current: 1,
      label: "Wi-Fi",
      onNext: jest.fn(),
      onPrevious: jest.fn(),
      total: 3,
    };
    const screen = render(<ButtonAppearanceInspectorControls {...props} />);

    expect(screen.queryByText("Wi-Fi · 1 of 3")).toBeNull();
    expect(screen.getByTestId("button-appearance-navigation").props.className)
      .toContain("absolute");
    expect(screen.queryByTestId("button-appearance-new")).toBeNull();
    expect(screen.queryByTestId("button-appearance-before")).toBeNull();

    fireEvent.press(screen.getByTestId("button-appearance-previous"));
    fireEvent.press(screen.getByTestId("button-appearance-next"));

    expect(props.onPrevious).toHaveBeenCalledTimes(1);
    expect(props.onNext).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("button-appearance-previous").props.className)
      .toContain("min-w-11");
  });

  it("omits navigation controls for a single Button", () => {
    const screen = render(
      <ButtonAppearanceInspectorControls
        onNext={jest.fn()}
        onPrevious={jest.fn()}
        total={1}
      />,
    );

    expect(screen.queryByTestId("button-appearance-navigation")).toBeNull();
    expect(screen.queryByTestId("button-appearance-previous")).toBeNull();
    expect(screen.queryByTestId("button-appearance-next")).toBeNull();
  });
});
