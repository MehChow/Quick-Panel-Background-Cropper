const en = {
  translation: {
    common: {
      cancel: "Cancel",
      close: "Close",
      confirm: "Confirm",
    },
    home: {
      title: "Quick Panel Background Cropper",
      subtitle: "Customize your background in the Quick Panel",
    },
    landing: {
      startCustomizing: "Start customizing",
      calibrated: "Calibrated.",
      recalibrate: "Want to recalibrate?",
      calibration: "Calibration",
      calibrationRequired:
        "Calibrate once before using, you can adjust it again later",
      example: "Example",
    },
    mode: {
      title: "Select mode",
      subtitle: "Choose your Quick Panel layout",
      default: "Default",
      defaultDescription:
        "For the standard Button box, Brightness, Volume, and Media player layout.",
      advanced: "Advanced",
      advancedDescription:
        "For rearranged, resized, vertical, or otherwise customized panel layouts.",
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
    },
    customize: {
      title: "Customize",
      subtitle: "Choose an image, then adjust the position",
      pickerTitle: "Choose an image from album",
      pickerSubtitle: "PNG, JPG, and WEBP are supported.",
      chooseAnotherImage: "Choose another image",
      resetPosition: "Reset position",
      exportPngs: "Export PNGs",
      defaultCalibrated: "Default layout calibrated.",
      advancedCalibrated: "Advanced layout calibrated.",
      recalibrate: "Want to recalibrate?",
    },
    advancedCalibration: {
      title: "Advanced customization",
      outerSubtitle:
        "Wrap the full area containing your four customizable panels",
      panelsSubtitle: "Move and resize each box to match its panel",
      adjustPanels: "Adjust panels",
      adjustOuter: "Adjust outer area",
      save: "Save layout",
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
      advancedLabel: "One UI 8.5 advanced layout",
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
      mediaLibraryPermission:
        "Media library permission is required to save exports.",
      exportSurfaceMissing: "Export surface is missing for {{panel}}.",
      unableToExport: "Unable to export images.",
      confirmOuterFirst: "Confirm the outer customization area first.",
      invalidAdvancedPanels:
        "Keep all four panel boxes inside the outer area without overlapping.",
    },
  },
};

export default en;
export type Translations = typeof en;
