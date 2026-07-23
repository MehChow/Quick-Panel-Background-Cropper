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
    },
  },
};
