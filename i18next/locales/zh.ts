const zh = {
  translation: {
    common: {
      close: "關閉",
    },
    home: {
      title: "Quick Panel 背景裁切",
      subtitle: "把你想要的圖片設成 Quick Panel 背景！",
    },
    landing: {
      startCustomizing: "開始自訂",
      calibrated: "已完成校準。",
      recalibrate: "想重新校準？",
      calibration: "校準",
      calibrationRequired:
        "只需要校準一次，之後匯出的圖片就能對齊你的 Quick Panel 版面。",
      example: "範例",
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
      title: "自訂",
      subtitle: "選擇一張圖片，再調整位置",
      pickerTitle: "從相簿選擇圖片",
      pickerSubtitle: "支援 PNG、JPG 與 WEBP。",
      chooseAnotherImage: "重新選擇圖片",
      resetPosition: "重設位置",
      exportPngs: "匯出 PNG",
    },
    export: {
      successTitle: "匯出成功",
      successSubtitle: "請依照這個順序在 Good Lock 中套用",
      convertAnother: "再轉換一張",
      albumName: "快速面板匯出",
    },
    preset: {
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
