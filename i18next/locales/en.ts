const en = {
  translation: {
    common: {
      back: "Back",
      cancel: "Cancel",
      close: "Close",
      next: "Next",
    },
    home: {
      title: "Quick Panel Background Cropper",
      subtitle: "Customize your background in the Quick Panel",
    },
    landing: {
      startCustomizing: "Start customizing",
      calibrated: "Calibrated.",
      calibratedStatus: "Calibrated",
      recalibrate: "Want to recalibrate?",
      calibration: "Calibration",
      calibrationRequired:
        "Calibrate once before using, you can adjust it again later",
      notCalibratedStatus: "Not calibrated",
      defaultLayoutTitle: "Default layout",
      defaultLayoutDescription:
        "Use the fast one-box calibration for the default One UI layout.",
      customLayoutTitle: "Custom layout",
      customLayoutDescription:
        "Calibrate each Quick Panel surface individually.",
      example: "Example",
    },
    calibration: {
      title: "Calibration",
      subtitle: "Match your device's layout",
      instruction:
        "Drag any edge or corner to resize the green box around the whole customizable control panel.",
      helpButton: "Open calibration help",
      helpTitle: "How to calibrate",
      likeThis: "Like this",
      importTitle: "Import Quick Panel screenshot",
      importSubtitle: "Use a fully expanded Quick Panel",
      chooseFromAlbum: "Choose from album",
      reImport: "Re-import",
      looksGood: "Looks good",
      continueWithOneScreenshot: "Continue with one screenshot",
      addSecondScreenshot: "Add second screenshot",
      alignOverlap: "Prepare two-shot alignment",
      dragToAlign: "Drag to align",
      trimSecondHeader: "Trim repeated phone header",
      useBox: "Use box",
      markHidden: "Mark hidden",
      panelStepCounter: "{{current}} / {{total}}",
      panelStepSubtitle:
        "Place a box around {{panel}}, or mark it hidden.",
      reviewCustomLayout: "Review custom layout",
      reviewTitle: "Review your custom layout",
      reviewSubtitle: "Hidden panels will be skipped during export.",
      saveCustomLayout: "Save custom layout",
      hiddenStatus: "Hidden",
      visibleStatus: "Visible",
    },
    customize: {
      title: "Customize",
      subtitle: "Choose an image, then adjust the position",
      pickerTitle: "Choose an image from album",
      pickerSubtitle: "PNG, JPG, and WEBP are supported.",
      chooseAnotherImage: "Choose another image",
      resetPosition: "Reset position",
      exportPngs: "Export PNGs",
    },
    export: {
      successTitle: "Exported successfully",
      successSubtitle: "Apply them in Good Lock using this order",
      openGoodLock: "Open Good Lock",
      openingGoodLock: "Opening Good Lock",
      goodLockUnavailableTitle: "Good Lock can't be opened",
      goodLockUnavailableDescription:
        "Good Lock may not be installed or cannot be opened here. Open Samsung Store to install it?",
      openSamsungStore: "Open Samsung Store",
      openingSamsungStore: "Opening Samsung Store",
      convertAnother: "Convert another",
      albumName: "Quick Panel Exports",
    },
    preset: {
      defaultLabel: "Galaxy S25+ / One UI 8.5 default",
      calibratedLabel: "{{label}} calibrated",
      customLabel: "Custom Quick Panel layout",
    },
    panels: {
      buttonBox: "Button box",
      brightness: "Brightness",
      volume: "Volume",
      mediaPlayer: "Media player",
    },
    errors: {
      mustCalibrate: "Calibrate your Quick Panel area before customizing.",
      importScreenshotFirst: "Import a Quick Panel screenshot first.",
      customCalibrationIncomplete:
        "Configure every panel and keep at least one panel visible before saving.",
      customCalibrationSecondScreenshotSizeMismatch:
        "The second screenshot must be a portrait image with the same width as the first screenshot.",
      mediaLibraryPermission:
        "Media library permission is required to save exports.",
      noPanelsToExport: "At least one panel must be visible before export.",
      exportSurfaceMissing: "Export surface is missing for {{panel}}.",
      unableToExport: "Unable to export images.",
    },
  },
};

export default en;
export type Translations = typeof en;
