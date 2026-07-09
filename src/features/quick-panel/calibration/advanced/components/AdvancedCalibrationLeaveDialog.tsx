import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ani-ui/alert-dialog";
import { useTranslation } from "react-i18next";

interface AdvancedCalibrationLeaveDialogProps {
  onClose: () => void;
  onLeave: () => void;
  open: boolean;
}

export function AdvancedCalibrationLeaveDialog({
  onClose,
  onLeave,
  open,
}: AdvancedCalibrationLeaveDialogProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="border border-slate-700 bg-slate-950">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("advancedCalibration.leaveTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("advancedCalibration.leaveBody")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onPress={onClose} className="border-0">
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction onPress={onLeave}>
            {t("advancedCalibration.leaveConfirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
