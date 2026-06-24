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

interface GoodLockUnavailableDialogProps {
  isOpeningSamsungStore: boolean;
  onClose: () => void;
  onOpenSamsungStore: () => Promise<void>;
  open: boolean;
}

export function GoodLockUnavailableDialog({
  isOpeningSamsungStore,
  onClose,
  onOpenSamsungStore,
  open,
}: GoodLockUnavailableDialogProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="border border-slate-700 bg-slate-950">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("export.goodLockUnavailableTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("export.goodLockUnavailableDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onPress={onClose} className="border-0">
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isOpeningSamsungStore}
            onPress={onOpenSamsungStore}
          >
            {isOpeningSamsungStore
              ? t("export.openingSamsungStore")
              : t("export.openSamsungStore")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
