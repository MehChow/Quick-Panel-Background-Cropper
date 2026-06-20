const zh = {
  translation: {
    common: {
      cancel: "取消",
      close: "關閉",
      confirm: "確認",
    },
    home: {
      title: "Quick Panel 背景裁切工具",
      subtitle: "將一張圖片無縫延伸到你的 Quick Panel 控制面板",
    },
    landing: {
      startCustomizing: "開始自訂",
      calibrated: "已校正。",
      recalibrate: "想重新校正？",
      calibration: "校正",
      calibrationRequired: "使用前先校正一次，之後也可以再調整",
      example: "範例",
    },
    mode: {
      title: "選擇模式",
      subtitle: "選擇最符合你的 Quick Panel 版面",
      default: "預設",
      defaultDescription:
        "適合標準版面：\n按鈕區 > 亮度條 > 音量條 > 媒體播放器",
      advanced: "進階",
      advancedDescription:
        "適合已重新排列、調整大小、垂直排列，或其他自訂過的版面。",
      helpTitle: "該選哪個模式？",
      helpSubtitle: "選擇最符合你目前 Quick Panel 版面的模式。",
    },
    calibration: {
      title: "校正",
      subtitle: "對齊你裝置上的版面",
      greenBoxLabel: "綠框",
      layoutBoundaryLabel: "版面邊界",
      instruction:
        "拖曳任一邊或角落，調整綠框大小，包住整個可自訂控制版面區域 (包括按鈕區、亮度條、音量條及媒體播放器)。",
      bestResultTitle: "最佳效果",
      bestResultGood: "讓綠框外緣剛好貼齊版面邊界，裁切會更準確。",
      bestResultBad: "避免讓綠框邊緣和版面邊界重疊。",
      helpButton: "開啟校正說明",
      helpTitle: "如何校正",
      likeThis: "像這樣",
      importTitle: "匯入 Quick Panel 截圖",
      importSubtitle: "請使用完全展開的 Quick Panel",
      chooseFromAlbum: "從相簿選擇",
      reImport: "重新匯入",
      looksGood: "確認",
    },
    customize: {
      optimizingImage: "最佳化圖片中...",
      imageOptimized: "已優化所選圖片，拖動調整會更順暢。",
      title: "自訂",
      subtitle: "選擇圖片後，再調整位置",
      pickerTitle: "從相簿選擇圖片",
      pickerSubtitle: "支援 PNG、JPG 和 WEBP。",
      chooseAnotherImage: "選擇另一張圖片",
      resetPosition: "重設位置",
      exportPngs: "匯出 PNG",
      defaultCalibrated: "預設版面已校正。",
      advancedCalibrated: "進階版面已校正。",
      recalibrate: "想重新校正？",
    },
    advancedCalibration: {
      title: "進階校正",
      outerSubtitle: "框住包含四個可自訂版面的完整區域",
      panelSelectionSubtitle: "關閉 Quick Panel 版面中不存在的面板",
      gridSubtitle: "先設定格線，再逐一調整已選擇的版面方框",
      panelSubtitle: "拖曳並調整 {{panel}} 範圍",
      confirmSubtitle: "儲存前確認已選擇的版面方框",
      panelHelpTitle: "如何對齊這個版面範圍",
      panelHelpBody:
        "拖曳並調整紫色方框，讓它剛好貼齊這個版面的邊緣。格線圓點應該落在版面周圍的留白處，而不是被紫色邊框壓住。當方框對齊正確時，這些圓點能幫助你判斷間距，讓整體版面更平均、更準確。",
      panelHelpGood:
        "讓紫色方框貼齊版面邊緣，讓格線圓點留在周圍留白處。",
      panelHelpBad:
        "不要讓紫色邊框壓到格線圓點，或跑進版面周圍的留白。",
      reviewHelpTitle: "如何檢查校正結果",
      reviewHelpBody:
        "儲存前，請確認每個橘色方框都準確貼齊對應版面的邊緣，版面之間的間距看起來也平均一致。這一步檢查得越精準，匯出的裁切圖片在 Good Lock 裡就越容易對齊。",
      columns: "欄",
      rows: "列",
      back: "返回",
      next: "下一步",
      gridHelpButton: "格線說明",
      gridControlsTitle: "設定對齊格線",
      panelSelectionTitle: "你的版面包含哪些面板？",
      panelSelectionBody:
        "關閉 Quick Panel 中沒有的 Controls 面板。已關閉的面板不需要校準，也不會匯出。",
      panelEnabled: "開",
      panelDisabled: "關",
      gridSheetTitle: "如何設定格線",
      gridSheetSubtitle:
        "選擇能讓格線圓點落在控制項之間留白處的列數與欄數。可參考下方範例，判斷哪一種格線更貼近你的截圖。",
    },
    export: {
      successTitle: "匯出成功",
      successSubtitle: "請依序套用到 QuickStar",
      openGoodLock: "開啟 Good Lock",
      openingGoodLock: "正在開啟 Good Lock",
      goodLockUnavailableTitle: "無法開啟 Good Lock",
      goodLockUnavailableDescription:
        "可能尚未安裝 Good Lock，或目前無法開啟。要前往 Samsung Store 安裝嗎？",
      openSamsungStore: "開啟 Samsung Store",
      openingSamsungStore: "正在開啟 Samsung Store",
      backHome: "返回首頁",
      albumName: "Quick Panel 匯出",
    },
    preset: {
      defaultLabel: "Galaxy S25+ / One UI 8.5 預設版面",
      calibratedLabel: "{{label}} 已校正",
      advancedLabel: "One UI 8.5 進階版面",
    },
    panels: {
      buttonBox: "按鈕區",
      brightness: "亮度條",
      volume: "音量條",
      mediaPlayer: "媒體播放器",
    },
    errors: {
      imageTooLarge: "這張圖片太大，無法順暢處理，請改選較小的圖片。",
      unableToProcessImage: "無法處理這張圖片。",
      mustCalibrate: "請先校正 Quick Panel 區域，再開始自訂。",
      importScreenshotFirst: "請先匯入 Quick Panel 截圖。",
      mediaLibraryPermission: "需要媒體庫權限才能儲存匯出圖片。",
      exportSurfaceMissing: "{{panel}} 的匯出預覽無法使用。",
      unableToExport: "無法匯出圖片。",
      confirmOuterFirst: "請先確認外層可自訂區域。",
      invalidAdvancedPanels:
        "請讓已選擇的版面方框保持在外層區域內，且不要互相重疊。",
      selectAdvancedPanel: "請至少選擇一個面板。",
    },
  },
};

export default zh;
export type Translations = typeof zh;
