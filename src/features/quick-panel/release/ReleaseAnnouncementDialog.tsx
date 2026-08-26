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
        {descriptor.mediaSources?.length ? (
          <View
            className="self-center flex-row gap-2 overflow-hidden"
            testID="release-announcement-media-wrapper"
            style={{
              borderRadius: 16,
              height: 120,
              overflow: "hidden",
              width: 240,
            }}
          >
            {descriptor.mediaSources.map((source, index) => (
              <Image
                key={index}
                accessibilityLabel={
                  index === 0 && descriptor.mediaAccessibilityKey
                    ? t(descriptor.mediaAccessibilityKey)
                    : undefined
                }
                accessible={index === 0 && Boolean(descriptor.mediaAccessibilityKey)}
                contentFit="contain"
                source={source}
                style={{ flex: 1, height: "100%" }}
                testID="release-announcement-media"
              />
            ))}
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
