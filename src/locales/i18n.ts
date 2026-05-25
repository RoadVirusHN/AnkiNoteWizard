import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from './en/common';
import koCommon from './ko/common';
import enPage from './en/page';
import koPage from './ko/page';
import enComponents from './en/components';
import koComponents from './ko/components';
import enError from './en/error';
import koError from './ko/error';
import enScript from './en/script';
import koScript from './ko/script';

export const resources = {
  en: {
    common: enCommon,
    page: enPage,
    components: enComponents,
    error: enError,
    script: enScript,
  },
  ko: {
    common: koCommon,
    page: koPage,
    components: koComponents,
    error: koError,
    script: koScript,
  },
};

export const i18nConfig = {
  // lng: useConfigure.getState().language, // set Language in App.tsx
  resources,
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'page', 'components', 'error', 'script'], // namespace 설정
  interpolation: {
    escapeValue: false,
    nsSeparator: false, // 콜론(:)을 구분자로 쓰지 않음
  },
  returnObjects: true, // 객체 반환 허용
};

i18n.use(initReactI18next).init(i18nConfig);

export default i18n;
