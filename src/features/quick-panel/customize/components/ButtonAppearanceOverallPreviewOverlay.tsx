import { useTranslation } from "react-i18next";
import { Pressable, useWindowDimensions, View } from "react-native";
import type { ButtonIdentifierPositions } from "../../model/button-identifier-layout";
import type { ButtonIdentifierContentMode } from "../../model/button-identifier-content";
import type {
  ImageTransform,
  PickedImage,
  QuickPanelPreset,
} from "../../model/types";
import type { ButtonIdentifierBackgroundTheme } from "../button-identifier-color";
import type { AnimatedButtonIdentifierAppearance } from "./button-identifier-animated-appearance";
import { QuickPanelPreview } from "./QuickPanelPreview";

interface ButtonAppearanceOverallPreviewOverlayProps {
  animatedAppearance?: AnimatedButtonIdentifierAppearance;
  backgroundTheme: ButtonIdentifierBackgroundTheme;
  buttonIdentifierColor: string;
  buttonIdentifierOpacity: number;
  buttonPanelOpacity: number;
  identifierPositions: ButtonIdentifierPositions;
  image: PickedImage;
  onDismiss: () => void;
  preset: QuickPanelPreset;
  previewUri: string;
  buttonIdentifierContentMode: ButtonIdentifierContentMode;
  transform: ImageTransform;
}

export function ButtonAppearanceOverallPreviewOverlay(
  props: ButtonAppearanceOverallPreviewOverlayProps,
) {
  const { t } = useTranslation();
  const { height: windowHeight } = useWindowDimensions();
  return (
    <View
      accessibilityViewIsModal
      className="flex-1 items-center justify-center p-6"
      testID="button-appearance-overall-preview-overlay"
    >
      <Pressable
        accessibilityLabel={t("customize.buttonAppearanceOverallPreviewClose")}
        accessibilityRole="button"
        className="absolute inset-0 bg-black/60"
        onPress={props.onDismiss}
        testID="button-appearance-overall-preview-backdrop"
      />
      <View
        className="w-full max-w-[430px] rounded-2xl border border-white/15 bg-slate-950 p-4"
        pointerEvents="box-none"
      >
        <QuickPanelPreview
          animatedButtonIdentifierAppearance={props.animatedAppearance}
          buttonIdentifierBackgroundTheme={props.backgroundTheme}
          buttonIdentifierColor={props.buttonIdentifierColor}
          buttonIdentifierOpacity={props.buttonIdentifierOpacity}
          buttonPanelOpacity={props.buttonPanelOpacity}
          identifierPositions={props.identifierPositions}
          image={props.image}
          interactive={false}
          maxHeight={Math.min(windowHeight * 0.7, 560)}
          onAdjustingChange={() => undefined}
          onTransformChange={() => undefined}
          preset={props.preset}
          previewUri={props.previewUri}
          showAppGradientBackground
          buttonIdentifierContentMode={props.buttonIdentifierContentMode}
          transform={props.transform}
        />
      </View>
    </View>
  );
}
