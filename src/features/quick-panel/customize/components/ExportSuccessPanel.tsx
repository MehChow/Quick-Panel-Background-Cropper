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
import { Button } from "@/components/ani-ui/button";
import { Card } from "@/components/ani-ui/card";
import { Text } from "@/components/ani-ui/text";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import type { GeneratedExport } from "../../model/types";
import { useGoodLockLink } from "../useGoodLockLink";

interface ExportSuccessPanelProps {
  exports: GeneratedExport[];
  onSecondaryAction: () => void;
  secondaryActionLabel: string;
}

export function ExportSuccessPanel({
  exports,
  onSecondaryAction,
  secondaryActionLabel,
}: ExportSuccessPanelProps) {
  const { t } = useTranslation();
  const {
    closeGoodLockDialog,
    isGoodLockDialogOpen,
    isOpeningGoodLock,
    isOpeningSamsungStore,
    openGoodLockApp,
    openSamsungStore,
  } = useGoodLockLink();

  return (
    <>
      <Card className="mb-4 items-center rounded-2xl border-emerald-400/30 bg-emerald-800/10">
        <Text className="text-center text-2xl font-bold text-white">
          {t("export.successTitle")}
        </Text>
        <Text className="mt-2 text-center text-sm leading-5 text-emerald-100">
          {t("export.successSubtitle")}
        </Text>

        <View className="mt-7 w-full flex-row flex-wrap justify-between gap-y-5">
          {exports.map((item) => (
            <View key={item.id} className="w-[47%] items-center">
              <View className="aspect-square w-full overflow-hidden rounded-2xl border border-emerald-300/40 bg-sky-200">
                <Image
                  key={`${item.id}-${item.previewUri}`}
                  cachePolicy="none"
                  source={{ uri: item.previewUri }}
                  contentFit="cover"
                  style={{ height: "100%", width: "100%" }}
                />
              </View>
              <Text className="mt-2 text-center text-sm font-medium text-emerald-100">
                {t(`panels.${item.id}`)}
              </Text>
            </View>
          ))}
        </View>

        <View className="mt-6 w-full gap-3">
          <Button
            className="w-full"
            loading={isOpeningGoodLock}
            onPress={openGoodLockApp}
            textClassName="font-semibold"
          >
            {isOpeningGoodLock
              ? t("export.openingGoodLock")
              : t("export.openGoodLock")}
          </Button>

          <Button
            className="w-full bg-black"
            onPress={onSecondaryAction}
            textClassName="font-semibold text-white"
          >
            {secondaryActionLabel}
          </Button>
        </View>
      </Card>

      <AlertDialog
        open={isGoodLockDialogOpen}
        onOpenChange={closeGoodLockDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("export.goodLockUnavailableTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("export.goodLockUnavailableDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onPress={closeGoodLockDialog}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isOpeningSamsungStore}
              onPress={openSamsungStore}
            >
              {isOpeningSamsungStore
                ? t("export.openingSamsungStore")
                : t("export.openSamsungStore")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
