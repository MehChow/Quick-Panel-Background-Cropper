import { Button } from "@/components/ani-ui/button";
import { Text } from "@/components/ani-ui/text";
import { Lucide } from "@react-native-vector-icons/lucide";
import { useTranslation } from "react-i18next";
import type { PropsWithChildren, ReactNode } from "react";
import { KeyboardAvoidingView, Modal, Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

interface ButtonLabelAppearanceDialogFrameProps extends PropsWithChildren {
  confirmDisabled: boolean;
  fullScreenContent?: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  onOpenOverallPreview: () => void;
  onRequestClose: () => void;
  open: boolean;
  scrollEnabled: boolean;
}

export function ButtonLabelAppearanceDialogFrame(
  props: ButtonLabelAppearanceDialogFrameProps,
) {
  const { t } = useTranslation();
  const normalContent = (
    <View className="flex-1" testID="button-label-appearance-root">
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
          <View className="flex-row items-center justify-between px-5 pb-3 pt-5">
            <Text className="text-lg font-semibold text-white">
              {t("customize.buttonIdentifierAppearance")}
            </Text>
            <Pressable
              accessibilityHint={t("customize.buttonAppearanceOverallPreviewHint")}
              accessibilityLabel={t("customize.buttonAppearanceOverallPreview")}
              accessibilityRole="button"
              className="h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-zinc-950"
              onPress={props.onOpenOverallPreview}
              testID="button-label-appearance-overall-preview"
            >
              <Lucide color="#ffffff" name="eye" size={20} />
            </Pressable>
          </View>
          <ScrollView
            className="px-5"
            contentContainerStyle={{ gap: 16, paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={props.scrollEnabled}
            testID="button-label-appearance-scroll"
          >
            {props.children}
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
              disabled={props.confirmDisabled}
              onPress={props.onConfirm}
              testID="button-label-appearance-confirm"
              textClassName="text-green-900"
            >
              {t("common.confirm")}
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );

  return (
    <Modal
      accessibilityViewIsModal
      animationType="fade"
      onRequestClose={props.onRequestClose}
      transparent
      visible={props.open}
    >
      {props.fullScreenContent ?? normalContent}
    </Modal>
  );
}
