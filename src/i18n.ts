// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { createMMKV } from 'react-native-mmkv';

import es from './locales/es.json';
import en from './locales/en.json';
import pt from './locales/pt.json';
import { LanguageCode } from './constants/languages';

const storage = createMMKV({ id: 'settings-storage' });

const languageDetector = {
  type: 'languageDetector' as const,
  async: false,
  detect: () => {
    const saved = storage.getString('user-language');
    if (saved) return saved;

    const locales = Localization.getLocales();
    return locales[0]?.languageCode ?? LanguageCode.ES;
  },
  init: () => {},
  cacheUserLanguage: (lng: string) => {
    storage.set('user-language', lng);
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
      pt: { translation: pt },
    },
    fallbackLng: 'es',
    compatibilityJSON: 'v4', 
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;