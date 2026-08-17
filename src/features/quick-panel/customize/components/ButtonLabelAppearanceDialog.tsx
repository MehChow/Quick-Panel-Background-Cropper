import { Text } from "@/components/ani-ui/text";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { colorKit } from "reanimated-color-picker";
import { View } from "react-native";
import type { ButtonIdentifierPositions } from "../../model/button-identifier-layout";
import type { ButtonIdentifierContentMode } from "../../model/button-identifier-content";
import type {
  ImageTransform,
  PickedImage,
  QuickPanelPreset,
} from "../../model/types";
import type {
  ButtonIdentifierAppearance,
  ButtonIdentifierBackgroundTheme,
} from "../button-identifier-color";
import {
  getCycledButtonIndex,
  getInspectableButtonPanels,
} from "../focused-button-inspector";
import { useButtonLabelAppearanceDraft } from "../hooks/useButtonLabelAppearanceDraft";
import { ButtonAppearanceInspectorControls } from "./ButtonAppearanceInspectorControls";
import { ButtonLabelAppearanceDialogFrame } from "./ButtonLabelAppearanceDialogFrame";
import { ButtonAppearanceOverallPreviewOverlay } from "./ButtonAppearanceOverallPreviewOverlay";
import { ButtonLabelColorPicker } from "./ButtonLabelColorPicker";
import { FocusedButtonAppearancePreview } from "./FocusedButtonAppearancePreview";

interface ButtonLabelAppearanceDialogProps {
  backgroundTheme: ButtonIdentifierBackgroundTheme;
  color: string;
  image: PickedImage;
  identifierPositions: ButtonIdentifierPositions;
  imageOpacity: number;
  onCancel: () => void;
  onConfirm: (appearance: ButtonIdentifierAppearance) => void;
  opacity: number;
  open: boolean;
  preset: QuickPanelPreset;
  previewUri: string;
  buttonIdentifierContentMode: ButtonIdentifierContentMode;
  transform: ImageTransform;
}

export function ButtonLabelAppearanceDialog(props: ButtonLabelAppearanceDialogProps) {
  const { t } = useTranslation();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isOverallPreviewOpen, setIsOverallPreviewOpen] = useState(false);
  const [isPickerInteracting, setIsPickerInteracting] = useState(false);
  const draft = useButtonLabelAppearanceDraft(
    props.color,
    props.opacity,
    props.backgroundTheme,
  );
  const initialValue = colorKit
    .setAlpha(props.color, props.opacity / 100)
    .rgb()
    .string(true);
  const inspectablePanels = getInspectableButtonPanels(props.preset);
  const focusedPanel =
    inspectablePanels[focusedIndex] ?? inspectablePanels[0];
  const cycleFocus = (direction: -1 | 1) => {
    setFocusedIndex((current) =>
      getCycledButtonIndex(current, inspectablePanels.length, direction),
    );
  };
  const handleRequestClose = () => {
    if (isOverallPreviewOpen) {
      setIsOverallPreviewOpen(false);
      return;
    }
    props.onCancel();
  };
  const overallPreview = isOverallPreviewOpen ? (
    <ButtonAppearanceOverallPreviewOverlay
      animatedAppearance={draft.animatedAppearance}
      backgroundTheme={draft.backgroundTheme}
      buttonIdentifierColor={props.color}
      buttonIdentifierOpacity={props.opacity / 100}
      buttonPanelOpacity={props.imageOpacity}
      identifierPositions={props.identifierPositions}
      image={props.image}
      onDismiss={() => setIsOverallPreviewOpen(false)}
      preset={props.preset}
      previewUri={props.previewUri}
      buttonIdentifierContentMode={props.buttonIdentifierContentMode}
      transform={props.transform}
    />
  ) : undefined;
  return (
    <ButtonLabelAppearanceDialogFrame
      confirmDisabled={draft.confirmDisabled || focusedPanel === undefined}
      fullScreenContent={overallPreview}
      onCancel={props.onCancel}
      onConfirm={() => props.onConfirm(draft.readConfirmedAppearance())}
      onOpenOverallPreview={() => setIsOverallPreviewOpen(true)}
      onRequestClose={handleRequestClose}
      open={props.open}
      scrollEnabled={!isPickerInteracting}
    >
      {focusedPanel ? (
        <>
          <View className="relative w-full items-center">
            <FocusedButtonAppearancePreview
              animatedAppearance={draft.animatedAppearance}
              backgroundTheme={draft.backgroundTheme}
              buttonIdentifierColor={props.color}
              buttonIdentifierOpacity={props.opacity / 100}
              buttonPanelOpacity={props.imageOpacity}
              identifierPositions={props.identifierPositions}
              image={props.image}
              panel={focusedPanel}
              preset={props.preset}
              previewUri={props.previewUri}
              buttonIdentifierContentMode={props.buttonIdentifierContentMode}
              transform={props.transform}
            />
            <ButtonAppearanceInspectorControls
              onNext={() => cycleFocus(1)}
              onPrevious={() => cycleFocus(-1)}
              total={inspectablePanels.length}
            />
          </View>
          <ButtonLabelColorPicker
            backgroundTheme={draft.backgroundTheme}
            error={draft.error}
            hexText={draft.hexText}
            initialValue={initialValue}
            onBackgroundThemeChange={draft.handleBackgroundThemeChange}
            onChange={draft.handlePickerChange}
            onComplete={draft.handlePickerComplete}
            onHexChange={draft.handleHexChange}
            onInteractionEnd={() => setIsPickerInteracting(false)}
            onInteractionStart={() => setIsPickerInteracting(true)}
            pickerRef={draft.pickerRef}
          />
        </>
      ) : (
        <Text
          className="py-12 text-center text-sm text-zinc-300"
          testID="button-appearance-unavailable"
        >
          {t("customize.buttonAppearanceUnavailable")}
        </Text>
      )}
    </ButtonLabelAppearanceDialogFrame>
  );
}
