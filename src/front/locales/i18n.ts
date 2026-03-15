import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './en.json';
import koTranslations from './ko.json';

const config = {
  resources: {
    en: { translation: enTranslations },
    ko: { translation: koTranslations },
  },
  // lng: useConfigure.getState().language, // set Language in App.tsx
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
    nsSeparator: false,  // 콜론(:)을 구분자로 쓰지 않음
  },
  returnObjects: true, // 객체 반환 허용
};
// json rules
// no special characters in keys.(just delete them)
// compress spaces to single space.
i18n.use(initReactI18next).init(config);

export default i18n;
