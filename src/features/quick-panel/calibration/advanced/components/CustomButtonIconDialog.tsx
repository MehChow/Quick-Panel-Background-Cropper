import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ani-ui/alert-dialog";
import { useTranslation } from "react-i18next";
import { useWindowDimensions } from "react-native";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ani-ui/tabs";
import {
  buttonLabelCatalog,
  customButtonIconChoices,
  type CustomButtonIconId,
} from "../../../model/button-labels";
import { ButtonIconChoiceGrid } from "./ButtonIconChoiceGrid";

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
  const { height } = useWindowDimensions();
  const presetChoices = buttonLabelCatalog.map((item) => ({
    id: item.iconName,
    label: t(item.translationKey),
  }));
  const otherChoices = customButtonIconChoices.map((item) => ({
    id: item.id,
    label: t(item.translationKey),
  }));
  const maxGridHeight = Math.min(320, height * 0.45);

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
        <Tabs key={label} defaultValue="preset" size="sm">
          <TabsList className="w-full border border-white/15 bg-zinc-800/95">
            <TabsTrigger
              activeClassName="bg-black"
              activeTextClassName="text-white"
              value="preset"
            >
              {t("advancedCalibration.customIconPresetTab")}
            </TabsTrigger>
            <TabsTrigger
              activeClassName="bg-black"
              activeTextClassName="text-white"
              value="other"
            >
              {t("advancedCalibration.customIconOtherTab")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="preset">
            <ButtonIconChoiceGrid
              choices={presetChoices}
              maxHeight={maxGridHeight}
              onSelect={onSelect}
              testID="preset-button-icon-grid"
            />
          </TabsContent>
          <TabsContent value="other">
            <ButtonIconChoiceGrid
              choices={otherChoices}
              maxHeight={maxGridHeight}
              onSelect={onSelect}
              testID="other-button-icon-grid"
            />
          </TabsContent>
        </Tabs>
        <AlertDialogFooter>
          <AlertDialogCancel onPress={onClose} className="border-0">
            {t("common.cancel")}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
