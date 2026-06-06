import { Text } from "@/components/ani-ui/text";
import { getPanelLabel } from "@/features/quick-panel/model/i18n";
import { SubPageHeader } from "@/features/quick-panel/shared/SubPageHeader";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CalibrationControls } from "./CalibrationControls";
import { CalibrationHelpSheet } from "./CalibrationHelpSheet";
import { CalibrationCanvas } from "./components/CalibrationCanvas";
import { CustomCalibrationCanvas } from "./components/CustomCalibrationCanvas";
import { CustomCalibrationOverlapAligner } from "./components/CustomCalibrationOverlapAligner";
import { CustomCalibrationReview } from "./components/CustomCalibrationReview";
import { CustomCalibrationStepper } from "./components/CustomCalibrationStepper";
import { useCalibrationScreen } from "./hooks/useCalibrationScreen";

export function CalibrationScreen() {
  const { t } = useTranslation();
  const {
    calibrationMode,
    customCalibrationSession,
    error,
    isHelpOpen,
    displayedScreenshot,
    displayedRect,
    isCalibrating,
    customCalibrationDraft,
    customCalibrationStep,
    currentCustomRect,
    currentStepIndex,
    isCurrentCustomHidden,
    isCustomCalibrationReview,
    isLastCustomStep,
    stepCount,
    setCalibrationRect,
    setCurrentCustomRect,
    importScreenshot,
    goToNextCustomStep,
    goToPreviousCustomStep,
    markCurrentCustomHidden,
    markCurrentCustomPresent,
    setCustomCalibrationSourceMode,
    setCustomCalibrationBottomCropTopY,
    setCustomCalibrationBottomOffsetY,
    importCustomBottomScreenshot,
    confirmCustomCalibrationAlignment,
    leaveCustomReview,
    saveCalibration,
    openHelp,
    closeHelp,
  } = useCalibrationScreen();
  const isCustomMode = calibrationMode === "custom-panels";
  const currentPanelLabel = getPanelLabel(customCalibrationStep);
  const topScreenshot = customCalibrationSession.topScreenshot;
  const isAlignmentConfirmed =
    customCalibrationSession.sourceMode === "single" ||
    customCalibrationSession.mergedHeight !== null;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="px-5 pt-8">
        <SubPageHeader
          onHelpPress={openHelp}
          title={t("calibration.title")}
          subtitle={t("calibration.subtitle")}
        />
      </View>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        overScrollMode="never"
      >
        {isCustomMode ? (
          isCustomCalibrationReview ? (
            <CustomCalibrationReview
              onBack={leaveCustomReview}
              onSave={saveCalibration}
              profile={customCalibrationDraft}
            />
          ) : !topScreenshot ? (
            <View className="gap-4">
              <CustomCalibrationStepper
                mode="entry"
                onSelectSourceMode={setCustomCalibrationSourceMode}
                sourceMode={customCalibrationSession.sourceMode}
              />
              <CalibrationCanvas
                screenshot={null}
                rect={null}
                onImport={importScreenshot}
                onRectChange={setCalibrationRect}
                onContinue={saveCalibration}
                showControls={false}
              />
            </View>
          ) : customCalibrationSession.sourceMode === "double" &&
            !isAlignmentConfirmed ? (
            <View className="gap-4">
              <CustomCalibrationOverlapAligner
                bottomCropTopY={customCalibrationSession.bottomCropTopY}
                bottomOffsetY={customCalibrationSession.bottomOffsetY}
                bottomScreenshot={customCalibrationSession.bottomScreenshot}
                onBottomCropTopYChange={setCustomCalibrationBottomCropTopY}
                onBottomOffsetYChange={setCustomCalibrationBottomOffsetY}
                topScreenshot={topScreenshot}
              />
              <CustomCalibrationStepper
                hasBottomScreenshot={Boolean(
                  customCalibrationSession.bottomScreenshot,
                )}
                mode="alignment"
                onAddSecondScreenshot={importCustomBottomScreenshot}
                onContinue={confirmCustomCalibrationAlignment}
              />
            </View>
          ) : displayedScreenshot ? (
            <View className="gap-4">
              <CustomCalibrationCanvas
                isHidden={isCurrentCustomHidden}
                onRectChange={setCurrentCustomRect}
                rect={currentCustomRect}
                session={customCalibrationSession}
              />
              <CustomCalibrationStepper
                mode="panel"
                canGoBack={currentStepIndex > 0}
                isHidden={isCurrentCustomHidden}
                isLastStep={isLastCustomStep}
                onBack={goToPreviousCustomStep}
                onMarkHidden={markCurrentCustomHidden}
                onMarkPresent={markCurrentCustomPresent}
                onNext={goToNextCustomStep}
                panelLabel={currentPanelLabel}
                stepCount={stepCount}
                stepIndex={currentStepIndex}
              />
            </View>
          ) : (
            <View />
          )
        ) : (
          <CalibrationCanvas
            screenshot={displayedScreenshot}
            rect={displayedRect}
            onImport={importScreenshot}
            onRectChange={setCalibrationRect}
            onContinue={saveCalibration}
            showControls={!isCalibrating}
          />
        )}
        {error ? (
          <Text className="mt-4 rounded-md bg-red-500/15 p-3 text-sm text-red-100">
            {error}
          </Text>
        ) : null}
      </ScrollView>
      {isCalibrating && !isCustomMode ? (
        <View className="border-t border-white/10 px-5">
          <CalibrationControls
            onContinue={saveCalibration}
            onImport={importScreenshot}
          />
        </View>
      ) : null}
      {isHelpOpen ? (
        <CalibrationHelpSheet
          calibrationMode={calibrationMode}
          onClose={closeHelp}
        />
      ) : null}
    </SafeAreaView>
  );
}
