import { useState } from "react";
import { View } from "react-native";
import type {
  ImageTransform,
  PickedImage,
  QuickPanelPreset,
} from "../../model/types";
import type { ButtonCustomizeControlState } from "../hooks/useButtonCustomizeControls";
import { ButtonCustomizeControls } from "./ButtonCustomizeControls";
import { QuickPanelPreview } from "./QuickPanelPreview";

interface CustomizePreviewSectionProps {
  buttonControls: ButtonCustomizeControlState;
  image: PickedImage;
  onAdjustingChange: (value: boolean) => void;
  onTransformChange: (value: ImageTransform) => void;
  preset: QuickPanelPreset;
  previewUri: string;
  transform: ImageTransform;
}

export function CustomizePreviewSection({
  buttonControls,
  image,
  onAdjustingChange,
  onTransformChange,
  preset,
  previewUri,
  transform,
}: CustomizePreviewSectionProps) {
  const [previewSlotHeight, setPreviewSlotHeight] = useState(0);
  const hasButtonPanels = preset.visualOrder.some(
    (id) => preset.panels[id]?.family === "button",
  );

  return (
    <View
      className={
        hasButtonPanels ? "flex-1 items-center gap-4" : "flex-1 items-center"
      }
    >
      <View
        className="w-full flex-1 items-center justify-center"
        onLayout={(event) => setPreviewSlotHeight(event.nativeEvent.layout.height)}
      >
        <QuickPanelPreview
          buttonIdentifierOpacity={buttonControls.buttonIdentifierOpacity / 100}
          buttonPanelOpacity={buttonControls.buttonPanelOpacity / 100}
          identifierPositions={buttonControls.identifierPositions}
          image={image}
          onAdjustingChange={onAdjustingChange}
          onTransformChange={onTransformChange}
          preset={preset}
          previewUri={previewUri}
          maxHeight={previewSlotHeight || undefined}
          showButtonIdentifiers={buttonControls.showButtonIdentifiers}
          transform={transform}
        />
      </View>
      {hasButtonPanels ? (
        <ButtonCustomizeControls
          buttonIdentifierOpacity={buttonControls.buttonIdentifierOpacity}
          buttonPanelOpacity={buttonControls.buttonPanelOpacity}
          hasHorizontalButtons={buttonControls.hasHorizontalButtons}
          hasVerticalButtons={buttonControls.hasVerticalButtons}
          horizontalIdentifierPosition={buttonControls.horizontalIdentifierPosition}
          onButtonIdentifierOpacityChange={buttonControls.setButtonIdentifierOpacity}
          onButtonPanelOpacityChange={buttonControls.setButtonPanelOpacity}
          onHorizontalIdentifierPositionChange={buttonControls.setHorizontalIdentifierPosition}
          onShowButtonIdentifiersChange={buttonControls.setShowButtonIdentifiers}
          onVerticalIdentifierPositionChange={buttonControls.setVerticalIdentifierPosition}
          showButtonIdentifiers={buttonControls.showButtonIdentifiers}
          verticalIdentifierPosition={buttonControls.verticalIdentifierPosition}
        />
      ) : null}
    </View>
  );
}
