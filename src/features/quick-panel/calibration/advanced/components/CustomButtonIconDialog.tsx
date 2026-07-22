import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ani-ui/alert-dialog";
import { Lucide } from "@react-native-vector-icons/lucide";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import {
  customButtonIconChoices,
  type CustomButtonIconId,
} from "../../../model/button-labels";

interface CustomButtonIconDialogProps {
  label: string;
  onClose: () => void;
  onSelect: (iconId: CustomButtonIconId) => void;
  open: boolean;
}

export function CustomButtonIconDialog({
  label,
  onClose,
  onSelect,
  open,
}: CustomButtonIconDialogProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="border border-slate-700 bg-slate-950">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("advancedCalibration.customIconDialogTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("advancedCalibration.customIconDialogBody", { label })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <View className="gap-3">
          {[customButtonIconChoices.slice(0, 4), customButtonIconChoices.slice(4)].map(
            (row, rowIndex) => (
              <View key={rowIndex} className="flex-row gap-3">
                {row.map((choice) => {
                  const choiceLabel = t(choice.translationKey);
                  return (
                    <Pressable
                      key={choice.id}
                      accessibilityLabel={choiceLabel}
                      accessibilityRole="button"
                      className="aspect-square flex-1 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 p-2"
                      onPress={() => onSelect(choice.id)}
                    >
                      <Lucide color="#ffffff" name={choice.id} size={24} />
                    </Pressable>
                  );
                })}
              </View>
            ),
          )}
        </View>
        <AlertDialogFooter>
          <AlertDialogCancel onPress={onClose} className="border-0">
            {t("common.cancel")}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
