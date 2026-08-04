import { useTranslation } from "react-i18next";
import { useState } from "react";
import { View } from "react-native";
import type { ButtonIdentifierPositions } from "../../model/button-identifier-layout";
import type {
  ImageTransform,
  PickedImage,
  QuickPanelPreset,
} from "../../model/types";
import type { ButtonIdentifierBackgroundTheme } from "../button-identifier-color";
import type { InspectableButtonPanel } from "../focused-button-inspector";
import type { AnimatedButtonIdentifierAppearance } from "./button-identifier-animated-appearance";
import { QuickPanelPreviewStage } from "./QuickPanelPreviewStage";

interface FocusedButtonAppearancePreviewProps {
  animatedAppearance?: AnimatedButtonIdentifierAppearance;
  backgroundTheme: ButtonIdentifierBackgroundTheme;
  buttonIdentifierColor: string;
  buttonIdentifierOpacity: number;
  buttonPanelOpacity: number;
  identifierPositions: ButtonIdentifierPositions;
  image: PickedImage;
  panel: InspectableButtonPanel;
  preset: QuickPanelPreset;
  previewUri: string;
  showButtonIdentifiers: boolean;
  transform: ImageTransform;
}

const maxPreviewHeight = 180;

export function FocusedButtonAppearancePreview(
  props: FocusedButtonAppearancePreviewProps,
) {
  const { t } = useTranslation();
  const [containerWidth, setContainerWidth] = useState(0);
  const displayScale = containerWidth > 0
    ? Math.min(
      containerWidth / props.panel.rect.width,
      maxPreviewHeight / props.panel.rect.height,
    )
    : 0;
  const previewWidth = props.panel.rect.width * displayScale;
  const previewRatio = props.panel.rect.width / props.panel.rect.height;
  const focusedPreset: QuickPanelPreset = {
    ...props.preset,
    panels: { [props.panel.id]: props.panel },
    visualOrder: [props.panel.id],
    goodLockOrder: [props.panel.id],
  };

  return (
    <View
      accessible
      accessibilityLabel={t("customize.buttonAppearancePreview", {
        label: props.panel.label,
      })}
      className="w-[70%] items-center justify-center"
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
      style={{ height: maxPreviewHeight }}
      testID="focused-button-appearance-preview"
    >
      {displayScale > 0 ? (
        <QuickPanelPreviewStage
          animatedButtonIdentifierAppearance={props.animatedAppearance}
          buttonIdentifierBackgroundTheme={props.backgroundTheme}
          buttonIdentifierColor={props.buttonIdentifierColor}
          buttonIdentifierOpacity={props.buttonIdentifierOpacity}
          buttonPanelOpacity={props.buttonPanelOpacity}
          handleLayout={() => undefined}
          identifierPositions={props.identifierPositions}
          image={props.image}
          layoutScale={displayScale}
          preset={focusedPreset}
          previewFrame={props.panel.rect}
          previewRatio={previewRatio}
          previewScale={displayScale}
          previewUri={props.previewUri}
          previewWidth={previewWidth}
          showAppGradientBackground
          showButtonIdentifiers={props.showButtonIdentifiers}
          transform={props.transform}
        />
      ) : null}
    </View>
  );
}
