import { useState } from "react";
import { View } from "react-native";
import type {
  ImageTransform,
  PickedImage,
  QuickPanelPreset,
} from "../../model/types";
import type { ButtonCustomizeControlState } from "../hooks/useButtonCustomizeControls";
import { ButtonCustomizeControls } from "./ButtonCustomizeControls";
import { ButtonLabelAppearanceDialog } from "./ButtonLabelAppearanceDialog";
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
  const [isAppearanceDialogOpen, setAppearanceDialogOpen] = useState(false);
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
        {isAppearanceDialogOpen ? null : (
          <QuickPanelPreview
            buttonIdentifierBackgroundTheme={buttonControls.buttonIdentifierBackgroundTheme}
            buttonIdentifierColor={buttonControls.buttonIdentifierColor}
            buttonIdentifierOpacity={buttonControls.buttonIdentifierOpacity / 100}
            buttonPanelOpacity={buttonControls.buttonPanelOpacity / 100}
            identifierPositions={buttonControls.identifierPositions}
            image={image}
            onAdjustingChange={onAdjustingChange}
            onTransformChange={onTransformChange}
            preset={preset}
            previewUri={previewUri}
            maxHeight={previewSlotHeight || undefined}
            buttonIdentifierContentMode={buttonControls.buttonIdentifierContentMode}
            transform={transform}
          />
        )}
      </View>
      {hasButtonPanels ? (
        <ButtonCustomizeControls
          buttonIdentifierBackgroundTheme={buttonControls.buttonIdentifierBackgroundTheme}
          buttonIdentifierColor={buttonControls.buttonIdentifierColor}
          buttonPanelOpacity={buttonControls.buttonPanelOpacity}
          hasHorizontalButtons={buttonControls.hasHorizontalButtons}
          hasVerticalButtons={buttonControls.hasVerticalButtons}
          horizontalIdentifierPosition={buttonControls.horizontalIdentifierPosition}
          onButtonPanelOpacityChange={buttonControls.setButtonPanelOpacity}
          onButtonPanelOpacityCommit={buttonControls.commitButtonPanelOpacity}
          onHorizontalIdentifierPositionChange={buttonControls.setHorizontalIdentifierPosition}
          onHorizontalIdentifierPositionCommit={
            buttonControls.commitHorizontalIdentifierPosition
          }
          onOpenButtonIdentifierAppearance={() => setAppearanceDialogOpen(true)}
          onButtonIdentifierContentModeChange={
            buttonControls.setButtonIdentifierContentMode
          }
          onVerticalIdentifierPositionChange={buttonControls.setVerticalIdentifierPosition}
          onVerticalIdentifierPositionCommit={
            buttonControls.commitVerticalIdentifierPosition
          }
          buttonIdentifierContentMode={buttonControls.buttonIdentifierContentMode}
          verticalIdentifierPosition={buttonControls.verticalIdentifierPosition}
        />
      ) : null}
      {hasButtonPanels && isAppearanceDialogOpen ? (
        <ButtonLabelAppearanceDialog
          backgroundTheme={buttonControls.buttonIdentifierBackgroundTheme}
          color={buttonControls.buttonIdentifierColor}
          identifierPositions={buttonControls.identifierPositions}
          image={image}
          imageOpacity={buttonControls.buttonPanelOpacity / 100}
          onCancel={() => setAppearanceDialogOpen(false)}
          onConfirm={(appearance) => {
            buttonControls.setButtonIdentifierAppearance(appearance);
            setAppearanceDialogOpen(false);
          }}
          opacity={buttonControls.buttonIdentifierOpacity}
          open
          preset={preset}
          previewUri={previewUri}
          buttonIdentifierContentMode={buttonControls.buttonIdentifierContentMode}
          transform={transform}
        />
      ) : null}
    </View>
  );
}
