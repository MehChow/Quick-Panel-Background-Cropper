import en from "./locales/en";
import zh from "./locales/zh";

export const enLocale = en;

export const zhLocale = {
  ...zh,
  translation: {
    ...zh.translation,
    customize: {
      ...zh.translation.customize,
      optimizingImage: "最佳化圖片中...",
      imageOptimized: "已優化所選圖片，拖曳調整會更順暢。",
    },
  },
};
