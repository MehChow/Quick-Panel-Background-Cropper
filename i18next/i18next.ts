import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import zh from "./locales/zh";

const supportedLanguages = ["en", "zh"] as const;
type SupportedLanguage = (typeof supportedLanguages)[number];

function getLanguage(): SupportedLanguage {
  const locale = getLocales()[0];
  const languageCode = locale?.languageCode?.toLowerCase();

  if (languageCode && supportedLanguages.includes(languageCode as SupportedLanguage)) {
    return languageCode as SupportedLanguage;
  }

  return "en";
}

export const lng = getLanguage();

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en,
      zh,
    },
    lng,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
