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
  showSourceImageContext: boolean;
  transform: ImageTransform;
}

export function CustomizePreviewSection({
  buttonControls,
  image,
  onAdjustingChange,
  onTransformChange,
  preset,
  previewUri,
  showSourceImageContext,
  transform,
}: CustomizePreviewSectionProps) {
  const hasButtonPanels = preset.visualOrder.some(
    (id) => preset.panels[id]?.family === "button",
  );

  return (
    <View className="items-center">
      <QuickPanelPreview
        buttonIdentifierOpacity={buttonControls.buttonIdentifierOpacity / 100}
        buttonPanelOpacity={buttonControls.buttonPanelOpacity / 100}
        identifierPositions={buttonControls.identifierPositions}
        image={image}
        onAdjustingChange={onAdjustingChange}
        onTransformChange={onTransformChange}
        preset={preset}
        previewUri={previewUri}
        showButtonIdentifiers={buttonControls.showButtonIdentifiers}
        showSourceImageContext={showSourceImageContext}
        transform={transform}
      />
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
