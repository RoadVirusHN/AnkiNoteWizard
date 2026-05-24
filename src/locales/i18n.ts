import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from './en/common';
import koCommon from './ko/common';
import enPage from './en/page';
import koPage from './ko/page';
import enComponent from './en/component';
import koComponent from './ko/component';
import enError from './en/error';
import koError from './ko/error';
import enScript from './en/script';
import koScript from './ko/script';

export const resources = {
  en: {
    common: enCommon,
    page: enPage,
    component: enComponent,
    error: enError,
    script: enScript,
  },
  ko: {
    common: koCommon,
    page: koPage,
    component: koComponent,
    error: koError,
    script: koScript,
  },
};

const config = {
  // lng: useConfigure.getState().language, // set Language in App.tsx
  resources,
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'page', 'component', 'error', 'script'], // namespace 설정
  interpolation: {
    escapeValue: false,
    nsSeparator: false, // 콜론(:)을 구분자로 쓰지 않음
  },
  returnObjects: true, // 객체 반환 허용
};
// json rules
// no special characters in keys.(just delete them)
// compress spaces to single space.
i18n.use(initReactI18next).init(config);

export default i18n;
