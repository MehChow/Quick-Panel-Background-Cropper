const zh = {
  translation: {
    common: {
      cancel: "取消",
      close: "關閉",
    },
    home: {
      title: "Quick Panel 背景裁切",
      subtitle: "把你想要的圖片設成 Quick Panel 背景",
    },
    landing: {
      startCustomizing: "開始自訂",
      calibrated: "已完成校準。",
      recalibrate: "想重新校準？",
      calibration: "校準",
      calibrationRequired: "使用前需先校準一次，日後可再次調整",
      example: "範例",
    },
    mode: {
      title: "選擇模式",
      subtitle: "選擇符合你快速面板配置的模式",
      default: "預設",
      defaultDescription: "適用於標準按鈕框、亮度、音量及媒體播放器配置。",
      advanced: "進階",
      advancedDescription: "適用於已重新排列、調整大小、垂直或其他自訂面板配置。",
    },
    calibration: {
      title: "校準",
      subtitle: "對齊你裝置上的快速面板版面",
      instruction:
        "拖曳任一邊緣或角落，調整綠色方框，框住整個可自訂的控制面板區域。",
      helpButton: "開啟校準說明",
      helpTitle: "校準說明",
      likeThis: "像這樣",
      importTitle: "匯入快速面板截圖",
      importSubtitle: "請使用完全展開的快速面板截圖",
      chooseFromAlbum: "從相簿選擇",
      reImport: "重新匯入",
      looksGood: "這樣可以",
    },
    customize: {
      defaultCalibrated: "已校準預設配置。",
      advancedCalibrated: "已校準進階配置。",
      recalibrate: "想重新校準嗎？",
      title: "自訂",
      subtitle: "選擇一張圖片，再調整位置",
      pickerTitle: "從相簿選擇圖片",
      pickerSubtitle: "支援 PNG、JPG 與 WEBP。",
      chooseAnotherImage: "重新選擇圖片",
      resetPosition: "重設位置",
      exportPngs: "匯出 PNG",
    },
    advancedCalibration: {
      title: "進階自訂",
      outerSubtitle: "框選包含四個可自訂面板的完整區域",
      panelsSubtitle: "移動及調整每個方框以符合對應面板",
      adjustPanels: "調整面板",
      adjustOuter: "調整外框",
      save: "儲存配置",
    },
    export: {
      successTitle: "匯出成功",
      successSubtitle: "請依照這個順序在 Good Lock 中套用",
      openGoodLock: "開啟 Good Lock",
      openingGoodLock: "正在開啟 Good Lock",
      goodLockUnavailableTitle: "無法開啟 Good Lock",
      goodLockUnavailableDescription:
        "Good Lock 可能尚未安裝，或目前無法在這裡開啟。要改去 Samsung Store 安裝嗎？",
      openSamsungStore: "開啟 Samsung Store",
      openingSamsungStore: "正在開啟 Samsung Store",
      convertAnother: "再轉換一張",
      albumName: "快速面板匯出",
    },
    preset: {
      advancedLabel: "One UI 8.5 進階配置",
      defaultLabel: "Galaxy S25+ / One UI 8.5 預設版型",
      calibratedLabel: "{{label}} 已校準",
    },
    panels: {
      buttonBox: "按鈕區塊",
      brightness: "亮度",
      volume: "音量",
      mediaPlayer: "媒體播放器",
    },
    errors: {
      confirmOuterFirst: "請先確認外框自訂區域。",
      invalidAdvancedPanels: "請保持四個面板方框位於外框內，並避免互相重疊。",
      mustCalibrate: "請先校準快速面板區域，才能開始自訂。",
      importScreenshotFirst: "請先匯入快速面板截圖。",
      mediaLibraryPermission: "必須授權媒體資料庫權限，才能儲存匯出圖片。",
      exportSurfaceMissing: "找不到 {{panel}} 的匯出畫面。",
      unableToExport: "無法匯出圖片。",
    },
  },
};

export default zh;
export type Translations = typeof zh;
