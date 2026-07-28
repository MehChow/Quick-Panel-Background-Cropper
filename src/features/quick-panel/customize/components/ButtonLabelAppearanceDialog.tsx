import { Button } from "@/components/ani-ui/button";
import { Text } from "@/components/ani-ui/text";
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";
import { colorKit } from "reanimated-color-picker";
import type { ButtonIdentifierPositions } from "../../model/button-identifier-layout";
import type {
  ImageTransform,
  PickedImage,
  QuickPanelPreset,
} from "../../model/types";
import type {
  ButtonIdentifierAppearance,
  ButtonIdentifierBackgroundTheme,
} from "../button-identifier-color";
import { useButtonLabelAppearanceDraft } from "../hooks/useButtonLabelAppearanceDraft";
import { ButtonLabelColorPicker } from "./ButtonLabelColorPicker";
import { QuickPanelPreview } from "./QuickPanelPreview";

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
  showButtonIdentifiers: boolean;
  transform: ImageTransform;
}

export function ButtonLabelAppearanceDialog(
  props: ButtonLabelAppearanceDialogProps,
) {
  const { t } = useTranslation();
  const draft = useButtonLabelAppearanceDraft(
    props.color,
    props.opacity,
    props.backgroundTheme,
  );
  const initialValue = colorKit
    .setAlpha(props.color, props.opacity / 100)
    .rgb()
    .string(true);
  return (
    <Modal
      accessibilityViewIsModal
      animationType="fade"
      onRequestClose={props.onCancel}
      transparent
      visible={props.open}
    >
      <View
        className="flex-1"
        testID="button-label-appearance-root"
      >
        <Pressable
          accessibilityLabel={t("customize.cancelButtonIdentifierAppearance")}
          className="absolute inset-0 bg-black/50"
          onPress={props.onCancel}
          testID="button-label-appearance-backdrop"
        />
        <KeyboardAvoidingView
          behavior="padding"
          className="flex-1 items-center justify-center px-5 py-8"
          keyboardVerticalOffset={12}
          pointerEvents="box-none"
          testID="button-label-appearance-keyboard-avoider"
        >
          <View
            className="max-h-full w-full max-w-[430px] overflow-hidden rounded-lg border border-slate-700 bg-slate-950"
            testID="button-label-appearance-card"
          >
            <Text className="px-5 pb-3 pt-5 text-lg font-semibold text-white">
              {t("customize.buttonIdentifierAppearance")}
            </Text>
            <ScrollView
              className="px-5"
              contentContainerStyle={{ gap: 16, paddingBottom: 20 }}
              keyboardShouldPersistTaps="handled"
              testID="button-label-appearance-scroll"
            >
              <QuickPanelPreview
                animatedButtonIdentifierAppearance={draft.animatedAppearance}
                buttonIdentifierBackgroundTheme={draft.backgroundTheme}
                buttonIdentifierColor={props.color}
                buttonIdentifierOpacity={props.opacity / 100}
                buttonPanelOpacity={props.imageOpacity}
                identifierPositions={props.identifierPositions}
                image={props.image}
                interactive={false}
                maxHeight={190}
                onAdjustingChange={() => undefined}
                onTransformChange={() => undefined}
                preset={props.preset}
                previewUri={props.previewUri}
                showAppGradientBackground
                showButtonIdentifiers={props.showButtonIdentifiers}
                transform={props.transform}
              />
              <ButtonLabelColorPicker
                backgroundTheme={draft.backgroundTheme}
                error={draft.error}
                hexText={draft.hexText}
                initialValue={initialValue}
                onChange={draft.handlePickerChange}
                onComplete={draft.handlePickerComplete}
                onBackgroundThemeChange={draft.handleBackgroundThemeChange}
                onHexChange={draft.handleHexChange}
                pickerRef={draft.pickerRef}
              />
            </ScrollView>
            <View className="flex-row gap-3 border-t border-white/10 px-5 py-4">
              <Button
                className="flex-1 bg-white"
                onPress={props.onCancel}
                testID="button-label-appearance-cancel"
                textClassName="text-black"
              >
                {t("common.cancel")}
              </Button>
              <Button
                className="flex-1 bg-green-200/90"
                disabled={draft.confirmDisabled}
                onPress={() => props.onConfirm(draft.readConfirmedAppearance())}
                textClassName="text-green-900"
              >
                {t("common.confirm")}
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
