const zh = {
  translation: {
    common: {
      cancel: "取消",
      close: "關閉",
      confirm: "確認",
    },
    home: {
      title: "Quick Panel 背景裁切工具",
      subtitle: "為你的 Quick Panel 自訂背景",
    },
    landing: {
      startCustomizing: "開始自訂",
      calibrated: "已完成校正。",
      recalibrate: "想重新校正嗎？",
      calibration: "校正",
      calibrationRequired: "使用前先校正一次，之後也可以再調整",
      example: "範例",
    },
    mode: {
      title: "選擇模式",
      subtitle: "選擇你的 Quick Panel 版面",
      default: "預設",
      defaultDescription:
        "適用於標準面板排列：\n按鈕區 > 亮度 > 音量 > 媒體播放器",
      advanced: "進階",
      advancedDescription:
        "適用於重新排列、調整大小、垂直排列或其他自訂面板版面。",
    },
    calibration: {
      title: "校正",
      subtitle: "對齊你裝置上的版面",
      instruction:
        "拖曳任一邊線或角點，讓綠色方框包住整個可自訂控制區。",
      helpButton: "開啟校正說明",
      helpTitle: "如何校正",
      likeThis: "像這樣",
      importTitle: "匯入 Quick Panel 截圖",
      importSubtitle: "請使用完全展開的 Quick Panel",
      chooseFromAlbum: "從相簿選擇",
      reImport: "重新匯入",
      looksGood: "看起來沒問題",
    },
    customize: {
      title: "自訂",
      subtitle: "選擇圖片後再調整位置",
      pickerTitle: "從相簿選擇圖片",
      pickerSubtitle: "支援 PNG、JPG 和 WEBP。",
      chooseAnotherImage: "換一張圖片",
      resetPosition: "重設位置",
      exportPngs: "匯出 PNG",
      defaultCalibrated: "預設版面已校正。",
      advancedCalibrated: "進階版面已校正。",
      recalibrate: "想重新校正嗎？",
    },
    advancedCalibration: {
      title: "進階校正",
      outerSubtitle: "框住四個可自訂面板所在的整個外框區域",
      panelSubtitle: "移動並調整 {{panel}} 方框",
      confirmSubtitle: "儲存前再次確認四個面板方框",
      columns: "欄數",
      rows: "列數",
      back: "返回",
      next: "下一步",
      gridSettingsButton: "開啟吸附格線設定",
      gridSheetTitle: "吸附格線",
      gridSheetSubtitle: "當格線和截圖對不上時，可以在這裡調整列數與欄數。",
    },
    export: {
      successTitle: "匯出成功",
      successSubtitle: "請在 Good Lock 中依序套用",
      openGoodLock: "開啟 Good Lock",
      openingGoodLock: "正在開啟 Good Lock",
      goodLockUnavailableTitle: "無法開啟 Good Lock",
      goodLockUnavailableDescription:
        "可能尚未安裝 Good Lock，或這裡無法直接開啟。要前往 Samsung Store 安裝嗎？",
      openSamsungStore: "開啟 Samsung Store",
      openingSamsungStore: "正在開啟 Samsung Store",
      backHome: "回到首頁",
      albumName: "Quick Panel 匯出",
    },
    preset: {
      defaultLabel: "Galaxy S25+ / One UI 8.5 預設版面",
      calibratedLabel: "{{label}} 已校正",
      advancedLabel: "One UI 8.5 進階版面",
    },
    panels: {
      buttonBox: "按鈕區",
      brightness: "亮度",
      volume: "音量",
      mediaPlayer: "媒體播放器",
    },
    errors: {
      mustCalibrate: "請先校正 Quick Panel 區域，再開始自訂。",
      importScreenshotFirst: "請先匯入 Quick Panel 截圖。",
      mediaLibraryPermission: "需要相簿權限才能儲存匯出圖片。",
      exportSurfaceMissing: "缺少 {{panel}} 的匯出畫面。",
      unableToExport: "無法匯出圖片。",
      confirmOuterFirst: "請先確認外框自訂區域。",
      invalidAdvancedPanels:
        "請讓四個面板方框保持在外框內，並避免彼此重疊。",
    },
  },
};

export default zh;
export type Translations = typeof zh;
