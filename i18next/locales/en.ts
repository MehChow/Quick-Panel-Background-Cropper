const en = {
  translation: {
    common: {
      close: "Close",
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
        "Calibration is only needed once so exports match your Quick Panel layout.",
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
      convertAnother: "Convert another",
      albumName: "Quick Panel Exports",
    },
    preset: {
      defaultLabel: "Galaxy S25+ / One UI 8.5 default",
      calibratedLabel: "{{label}} calibrated",
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
    },
  },
};

export default en;
export type Translations = typeof en;
