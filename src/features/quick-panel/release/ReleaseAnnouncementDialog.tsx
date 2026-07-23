import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ani-ui/alert-dialog";
import { useTranslation } from "react-i18next";
import type { ReleaseAnnouncementDescriptor } from "./ReleaseAnnouncementContent";

interface ReleaseAnnouncementDialogProps {
  descriptor: ReleaseAnnouncementDescriptor;
  onDismiss: () => void;
  open: boolean;
}

export function ReleaseAnnouncementDialog({
  descriptor,
  onDismiss,
  open,
}: ReleaseAnnouncementDialogProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={open} onOpenChange={onDismiss}>
      <AlertDialogContent className="border border-slate-700 bg-slate-950">
        <AlertDialogHeader>
          <AlertDialogTitle>{t(descriptor.titleKey)}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(descriptor.bodyKey)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onPress={onDismiss}>
            {t(descriptor.actionKey)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
