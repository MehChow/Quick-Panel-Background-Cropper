const en = {
  translation: {
    common: {
      cancel: "Cancel",
      close: "Close",
      confirm: "Confirm",
    },
    home: {
      title: "Quick Panel Background Cropper",
      subtitle: "Split one image seamlessly across your Quick Panel controls",
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
      subtitle: "Choose the Quick Panel layout that matches yours",
      default: "Default",
      defaultDescription:
        "For the standard layout:\nButton box > Brightness > Volume > Media player",
      advanced: "Advanced",
      advancedDescription:
        "For customized layouts with rearranged, resized, vertical, or other adjusted panels.",
      helpTitle: "Which mode should I choose?",
      helpSubtitle:
        "Pick the one that matches how your Quick Panel is arranged.",
    },
    calibration: {
      title: "Calibration",
      subtitle: "Match your device's layout",
      greenBoxLabel: "green box",
      layoutBoundaryLabel: "panel edge",
      instruction:
        "Drag any edge or corner to resize the green box around the whole customizable control panel, including Button box, Brightness, Volume and Media player.",
      bestResultTitle: "For best result",
      bestResultGood:
        "Keep the green box just outside the panel edge for the most accurate crop.",
      bestResultBad: "Do not let the green box edge overlap the panel edge.",
      helpButton: "Open calibration help",
      helpTitle: "How to calibrate",
      likeThis: "Like this",
      importTitle: "Import Quick Panel screenshot",
      importSubtitle: "Use a fully expanded Quick Panel",
      chooseFromAlbum: "Choose from album",
      reImport: "Re-import",
      looksGood: "Confirm",
    },
    customize: {
      title: "Customize",
      subtitle: "Choose an image, then adjust the position",
      optimizingImage: "Optimizing image...",
      imageOptimized: "Selected image was optimized for smoother adjustment.",
      pickerTitle: "Choose an image from album",
      pickerSubtitle: "PNG, JPG, and WEBP are supported.",
      chooseAnotherImage: "Choose another image",
      resetPosition: "Reset position",
      exportPngs: "Export PNGs",
      defaultCalibrated: "Default layout calibrated.",
      advancedCalibrated: "Advanced layout calibrated.",
      recalibrate: "Wanna recalibrate?",
    },
    advancedCalibration: {
      title: "Advanced calibration",
      outerSubtitle:
        "Wrap the full area containing your four customizable panels",
      panelSubtitle: "Drag and resize the {{panel}} area",
      confirmSubtitle: "Review all four panel boxes before saving",
      panelHelpTitle: "How to align this area",
      panelHelpBody:
        "Drag and resize the purple box so it sits exactly on the edges of this area. The grid dots should stay in the gaps around it, not under the purple border. When the box is aligned correctly, those dots help you judge the spacing and keep the overall layout even and accurate.",
      panelHelpGood:
        "Match the purple box to the area edges so the grid dots stay in the gaps.",
      panelHelpBad:
        "Do not place the purple border over the grid dots or into the spacing around the area.",
      reviewHelpTitle: "How to review your calibration",
      reviewHelpBody:
        "Before saving, check that every orange box sits cleanly on its panel edges and that the gaps between panels look even. A precise review here helps ensure your exported crops line up correctly in Good Lock.",
      columns: "Columns",
      rows: "Rows",
      back: "Back",
      next: "Next",
      gridHelpButton: "Grid help",
      gridSheetTitle: "How to set the grid",
      gridSheetSubtitle:
        "Choose the row and column counts that make the grid dots fall into the gaps between your controls. Use the examples below to decide which grid matches your screenshot more closely.",
    },
    export: {
      successTitle: "Exported successfully",
      successSubtitle: "Apply them in QuickStar correspondingly",
      openGoodLock: "Open Good Lock",
      openingGoodLock: "Opening Good Lock",
      goodLockUnavailableTitle: "Good Lock can't be opened",
      goodLockUnavailableDescription:
        "Good Lock might not be installed, or it can't be opened from here. Open Samsung Store to install it?",
      openSamsungStore: "Open Samsung Store",
      openingSamsungStore: "Opening Samsung Store",
      backHome: "Back home",
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
      exportSurfaceMissing: "The export preview for {{panel}} is unavailable.",
      imageTooLarge:
        "This image is too large to process smoothly. Please choose a smaller image.",
      unableToProcessImage: "Unable to process this image.",
      unableToExport: "Unable to export images.",
      confirmOuterFirst: "Confirm the outer customization area first.",
      invalidAdvancedPanels:
        "Keep all four panel boxes inside the outer area without overlapping.",
    },
  },
};

export default en;
export type Translations = typeof en;
