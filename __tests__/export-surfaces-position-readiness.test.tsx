import { ExportSurfaces } from "@/features/quick-panel/customize/components/ExportSurfaces";
import type { QuickPanelPreset } from "@/features/quick-panel/model/types";
import { act, render } from "@testing-library/react-native";

jest.mock(
  "@/features/quick-panel/customize/components/ExportSurface",
  () => {
    const React = jest.requireActual("react");
    const { View } = jest.requireActual("react-native");
    interface MockExportSurfaceProps {
      identifierPositions: { horizontal: number; vertical: number };
      onIdentifierPositionReady: () => void;
      onImageLoad: () => void;
      panel: {
        buttonIdentifier?: { columnSpan: number; rowSpan: number };
        id: string;
      };
      showButtonIdentifiers: boolean;
    }
    return {
      ExportSurface: React.forwardRef((props: MockExportSurfaceProps, _ref: unknown) => {
        const previousHorizontalPosition = React.useRef(
          props.identifierPositions.horizontal,
        );

        React.useEffect(() => {
          const didPositionChange = previousHorizontalPosition.current
            !== props.identifierPositions.horizontal;
          previousHorizontalPosition.current = props.identifierPositions.horizontal;
          const identifier = props.panel.buttonIdentifier;
          if (
            didPositionChange
            && props.showButtonIdentifiers
            && identifier
            && identifier.columnSpan > identifier.rowSpan
          ) {
            props.onIdentifierPositionReady();
          }
        }, [
          props.identifierPositions.horizontal,
          props.onIdentifierPositionReady,
          props.panel.buttonIdentifier,
          props.showButtonIdentifiers,
        ]);

        return React.createElement(
          View,
          null,
          React.createElement(View, {
            onSignal: props.onImageLoad,
            testID: `${props.panel.id}-image-ready`,
          }),
          React.createElement(View, {
            onSignal: props.onIdentifierPositionReady,
            testID: `${props.panel.id}-identifier-ready`,
          }),
        );
      }),
    };
  },
);

const preset = {
  id: "readiness-buttons",
  label: "Readiness Buttons",
  mode: "advanced",
  width: 100,
  height: 100,
  customizationArea: { x: 0, y: 0, width: 100, height: 100, radius: 0 },
  panels: {
    "button-1": {
      id: "button-1",
      label: "Wi-Fi",
      fileName: "01-wi-fi.png",
      family: "button",
      rect: { x: 0, y: 0, width: 100, height: 50, radius: 0 },
      buttonIdentifier: { columnSpan: 2, rowSpan: 1, iconName: "wifi" },
    },
    "button-2": {
      id: "button-2",
      label: "Bluetooth",
      fileName: "02-bluetooth.png",
      family: "button",
      rect: { x: 0, y: 50, width: 50, height: 100, radius: 0 },
      buttonIdentifier: { columnSpan: 1, rowSpan: 2, iconName: "bluetooth" },
    },
  },
  visualOrder: ["button-1", "button-2"],
  goodLockOrder: ["button-1", "button-2"],
} satisfies QuickPanelPreset;

const baseProps = {
  buttonIdentifierOpacity: 0.7,
  buttonPanelOpacity: 0.78,
  identifierPositions: { horizontal: 0.5, vertical: 0.5 },
  image: { height: 200, uri: "file:///background.png", width: 100 },
  loadToken: 1,
  onReady: jest.fn(),
  preset,
  refs: {},
  showButtonIdentifiers: true,
  transform: { scale: 1, x: 0, y: 0 },
};

describe("ExportSurfaces identifier readiness", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("waits for horizontal placement and resets for current render inputs", () => {
    const screen = render(<ExportSurfaces {...baseProps} />);
    const signal = (testID: string) => {
      act(() => screen.getByTestId(testID).props.onSignal());
    };

    signal("button-1-image-ready");
    signal("button-2-image-ready");
    signal("button-2-identifier-ready");
    expect(baseProps.onReady).not.toHaveBeenCalled();

    signal("button-1-identifier-ready");
    signal("button-1-identifier-ready");
    expect(baseProps.onReady).toHaveBeenCalledTimes(1);

    screen.rerender(
      <ExportSurfaces
        {...baseProps}
        identifierPositions={{ horizontal: 0.2, vertical: 0.8 }}
      />,
    );
    signal("button-1-image-ready");
    signal("button-2-image-ready");
    expect(baseProps.onReady).toHaveBeenCalledTimes(2);

    screen.rerender(<ExportSurfaces {...baseProps} showButtonIdentifiers={false} />);
    signal("button-1-image-ready");
    signal("button-2-image-ready");
    expect(baseProps.onReady).toHaveBeenCalledTimes(3);
  });
});
