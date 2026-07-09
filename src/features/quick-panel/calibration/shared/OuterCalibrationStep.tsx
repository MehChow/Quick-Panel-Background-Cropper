import { Button } from "@/components/ani-ui/button";
import { Text } from "@/components/ani-ui/text";
import { CalibrationHelpSheet } from "@/features/quick-panel/shared/CalibrationHelpSheet";
import { QuickPanelScreenShell } from "@/features/quick-panel/shared/QuickPanelScreenShell";
import { SubPageHeader } from "@/features/quick-panel/shared/SubPageHeader";
import {
  markHelpSeen,
  type HelpEntryId,
} from "@/features/quick-panel/store/storage";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import type { PanelRect, PickedImage } from "../../model/types";
import { CalibrationCanvas } from "./CalibrationCanvas";
import { RectSelectionOverlay } from "./RectSelectionOverlay";

interface OuterCalibrationStepProps {
  error: string | null;
  errorKey: string | null;
  footerTestID: string;
  helpId: HelpEntryId;
  primaryLabel: string;
  rect: PanelRect | null;
  screenshot: PickedImage | null;
  subtitle: string;
  title: string;
  getDisplayRect?: (rect: PanelRect) => PanelRect;
  onImport: () => void;
  onPrimaryPress: () => void;
  onRectChange: (rect: PanelRect) => void;
}

export function OuterCalibrationStep({
  error,
  errorKey,
  footerTestID,
  getDisplayRect,
  helpId,
  primaryLabel,
  rect,
  screenshot,
  subtitle,
  title,
  onImport,
  onPrimaryPress,
  onRectChange,
}: OuterCalibrationStepProps) {
  const { t } = useTranslation();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const isCalibrating = Boolean(screenshot && rect);

  const openHelp = () => {
    markHelpSeen(helpId);
    setIsHelpOpen(true);
  };

  return (
    <>
      <QuickPanelScreenShell
        footer={
          isCalibrating ? (
            <View className="flex-row gap-3 py-4">
              <Button
                className="flex-1 bg-white"
                onPress={onImport}
                textClassName="font-semibold text-black"
              >
                {t("calibration.reImport")}
              </Button>
              <Button
                className="flex-1 bg-green-200/90 px-0"
                onPress={onPrimaryPress}
                textClassName="font-semibold text-green-900 w-full"
              >
                {primaryLabel}
              </Button>
            </View>
          ) : (
            <Button
              className="my-4 w-full bg-white"
              onPress={onImport}
              textClassName="font-semibold text-black"
            >
              {t("calibration.chooseFromAlbum")}
            </Button>
          )
        }
        footerTestID={footerTestID}
        header={
          <SubPageHeader
            actionAccessibilityLabel={t("calibration.helpButton")}
            actionHelpId={helpId}
            actionVariant="helper-balanced"
            onActionPress={isCalibrating ? openHelp : undefined}
            title={title}
            subtitle={subtitle}
          />
        }
      >
        <CalibrationCanvas
          screenshot={screenshot}
          rect={rect}
          onImport={onImport}
          renderOverlay={(scale) =>
            rect && screenshot ? (
              <RectSelectionOverlay
                displayRect={getDisplayRect?.(rect) ?? rect}
                rect={rect}
                scale={scale}
                screenshot={screenshot}
                onRectChange={onRectChange}
              />
            ) : null
          }
          showControls={false}
          showImportButton={false}
        />
        {error ? (
          <Text className="mt-4 rounded-md bg-red-500/15 p-3 text-sm text-red-100">
            {error}
          </Text>
        ) : null}
        {errorKey ? (
          <Text className="mt-4 rounded-md bg-red-500/15 p-3 text-sm text-red-100">
            {t(errorKey)}
          </Text>
        ) : null}
      </QuickPanelScreenShell>
      {isHelpOpen ? (
        <CalibrationHelpSheet onClose={() => setIsHelpOpen(false)} />
      ) : null}
    </>
  );
}
