const zh = {
  translation: {
    common: {
      back: "返回",
      cancel: "取消",
      close: "關閉",
      next: "下一步",
    },
    home: {
      title: "Quick Panel 背景裁切器",
      subtitle: "在 Quick Panel 中自訂你的背景",
    },
    landing: {
      startCustomizing: "開始自訂",
      calibrated: "已完成校準。",
      calibratedStatus: "已校準",
      recalibrate: "想重新校準？",
      calibration: "校準",
      calibrationRequired: "使用前請先校準，之後仍可再次調整",
      notCalibratedStatus: "未校準",
      defaultLayoutTitle: "預設版面",
      defaultLayoutDescription: "使用快速單框校準預設 One UI 版面。",
      customLayoutTitle: "自訂版面",
      customLayoutDescription: "逐一校準每個 Quick Panel 區塊。",
      example: "範例",
    },
    calibration: {
      title: "校準",
      subtitle: "對齊你的裝置版面",
      instruction:
        "拖曳任一邊或角，調整綠色方框，框住整個可自訂控制面板區域。",
      defaultInstruction:
        "拖曳任一邊或角，調整綠色方框，框住整個可自訂控制面板區域。",
      customInstruction:
        "匯入完整展開的 Quick Panel 截圖，接著逐一在每個支援面板上放置綠色方框，或將它標記為隱藏。",
      helpButton: "開啟校準說明",
      helpTitle: "如何校準",
      likeThis: "像這樣",
      importTitle: "匯入 Quick Panel 截圖",
      importSubtitle: "使用完全展開的 Quick Panel",
      chooseFromAlbum: "從相簿選取",
      reImport: "重新匯入",
      looksGood: "看起來不錯",
      continueWithOneScreenshot: "只用一張截圖繼續",
      addSecondScreenshot: "加入第二張截圖",
      alignOverlap: "對齊重疊區域",
      useBox: "使用方框",
      markHidden: "標記為隱藏",
      panelStepCounter: "{{current}} / {{total}}",
      panelStepSubtitle: "在 {{panel}} 周圍放置方框，或將它標記為隱藏。",
      reviewCustomLayout: "檢查自訂版面",
      reviewTitle: "檢查你的自訂版面",
      reviewSubtitle: "隱藏的區塊在匯出時會被略過。",
      saveCustomLayout: "儲存自訂版面",
      hiddenStatus: "隱藏",
      visibleStatus: "顯示",
    },
    customize: {
      title: "自訂",
      subtitle: "選擇圖片後再調整位置",
      pickerTitle: "從相簿選擇圖片",
      pickerSubtitle: "支援 PNG、JPG 與 WEBP。",
      chooseAnotherImage: "換一張圖片",
      resetPosition: "重設位置",
      exportPngs: "匯出 PNG",
    },
    export: {
      successTitle: "匯出成功",
      successSubtitle: "請依照這個順序套用到 Good Lock",
      openGoodLock: "開啟 Good Lock",
      openingGoodLock: "正在開啟 Good Lock",
      goodLockUnavailableTitle: "無法開啟 Good Lock",
      goodLockUnavailableDescription:
        "這裡可能沒有安裝 Good Lock，或目前無法開啟。要前往 Samsung Store 安裝嗎？",
      openSamsungStore: "開啟 Samsung Store",
      openingSamsungStore: "正在開啟 Samsung Store",
      convertAnother: "再轉換一張",
      albumName: "Quick Panel 匯出",
    },
    preset: {
      defaultLabel: "Galaxy S25+ / One UI 8.5 預設版面",
      calibratedLabel: "{{label}} 已校準",
      customLabel: "自訂 Quick Panel 版面",
    },
    panels: {
      buttonBox: "按鈕區",
      brightness: "亮度",
      volume: "音量",
      mediaPlayer: "媒體播放器",
    },
    errors: {
      mustCalibrate: "開始自訂前，請先校準你的 Quick Panel 區域。",
      importScreenshotFirst: "請先匯入 Quick Panel 截圖。",
      customCalibrationIncomplete:
        "儲存前請先設定每個區塊，並至少保留一個可見區塊。",
      customCalibrationSecondScreenshotSizeMismatch:
        "第二張截圖必須和第一張截圖同寬，且兩張都要是直向截圖。",
      mediaLibraryPermission: "儲存匯出結果需要媒體庫權限。",
      noPanelsToExport: "匯出前至少要保留一個可見區塊。",
      exportSurfaceMissing: "{{panel}} 缺少匯出畫面。",
      unableToExport: "無法匯出圖片。",
    },
  },
};

export default zh;
export type Translations = typeof zh;
