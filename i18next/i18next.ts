import { getLocales } from "expo-localization";
import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import {
  isSupportedLanguage,
  type SupportedLanguage,
} from "../src/features/quick-panel/store/storage";
import { enLocale, zhLocale } from "./resources";

function getLanguage(): SupportedLanguage {
  const locale = getLocales()[0];
  const languageCode = locale?.languageCode?.toLowerCase();

  if (isSupportedLanguage(languageCode)) {
    return languageCode;
  }

  return "en";
}

export const lng = getLanguage();

const i18n = createInstance();

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: enLocale,
      zh: zhLocale,
    },
    lng,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
