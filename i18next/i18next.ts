import { getLocales } from "expo-localization";
import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import {
  isSupportedLanguage,
  type SupportedLanguage,
} from "../src/features/quick-panel/store/storage";
import { enLocale, esLocale, zhLocale } from "./resources";

export function resolveLanguage(
  languageCode: string | null | undefined,
): SupportedLanguage {
  const normalizedLanguageCode = languageCode?.toLowerCase();

  if (isSupportedLanguage(normalizedLanguageCode)) {
    return normalizedLanguageCode;
  }

  return "en";
}

export const lng = resolveLanguage(getLocales()[0]?.languageCode);

const i18n = createInstance();

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: enLocale,
      es: esLocale,
      zh: zhLocale,
    },
    lng,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
