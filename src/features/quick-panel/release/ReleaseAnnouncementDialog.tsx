import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ani-ui/alert-dialog";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
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
        {descriptor.mediaSource ? (
          <View
            className="self-center overflow-hidden"
            testID="release-announcement-media-wrapper"
            style={{
              borderRadius: 16,
              height: 240,
              overflow: "hidden",
              width: 111,
            }}
          >
            <Image
              accessibilityLabel={
                descriptor.mediaAccessibilityKey
                  ? t(descriptor.mediaAccessibilityKey)
                  : undefined
              }
              accessible={Boolean(descriptor.mediaAccessibilityKey)}
              contentFit="cover"
              source={descriptor.mediaSource}
              style={{ height: "100%", width: "100%" }}
            />
          </View>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogAction onPress={onDismiss} className="bg-white">
            <Text className="text-sm font-medium text-black">
              {t(descriptor.actionKey)}
            </Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
