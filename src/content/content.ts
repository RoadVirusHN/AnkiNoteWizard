import { messageHandler } from './messageHandler';
import i18n from '@/locales/i18n';
import { initReactI18next } from 'react-i18next';
import enTranslations from '@/locales/en.json';
import koTranslations from '@/locales/ko.json';
import { ScanRule, FIELD_DATA_TYPES, FieldProperties, ExtractedInfos, ExtractedFields } from '@/types/scanRule.types';

console.log('✅ Content script loaded');
export const initLocale = () => {
  const config = {
    resources: {
      en: { translation: enTranslations },
      ko: { translation: koTranslations },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
      nsSeparator: false,
    },
  };
  i18n.use(initReactI18next).init(config);
};

chrome.storage.sync.get('anki-card-wizard-configure-store', (result) => {
  const store = result['anki-card-wizard-configure-store'];
  if (store && store.state && store.state.language) {
    if (i18n.isInitialized === false) initLocale();
    i18n.changeLanguage(store.state.language);
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes['anki-card-wizard-configure-store']) {
    const { newValue, oldValue } = changes['anki-card-wizard-configure-store'];
    if (newValue?.state?.language !== oldValue?.state?.language) {
      const newLang = newValue.state.language;
      if (i18n.isInitialized === false) initLocale();
      i18n.changeLanguage(newLang);
    }
  }
});

const checkUrlMatched = (customCard: ScanRule): boolean => {
  customCard.urlPatterns = customCard.urlPatterns || ['body'];
  return (
    // use wildcard to match urlPattern
    customCard.urlPatterns.some((pattern) => {
      const patternHost = pattern.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];

      // 2. 입력된 패턴의 호스트 부분만 사용하여 정규식의 기반을 만듭니다.
      //    '*'는 '.*'로, 다른 특수문자는 이스케이프 처리합니다.
      const regexString =
        '^https?://(www\\.)?' + // 시작 부분에 선택적 https:// 또는 http:// 및 www.
        patternHost
          .split('*')
          .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
          .join('.*') +
        '($|/.*)'; // 끝 부분 또는 / 이하의 모든 문자열 허용

      const regex = new RegExp(regexString);

      // 3. 현재 URL에 대해 정규식 테스트
      return regex.test(window.location.href);
    })
  );
};
const extractFields = (root: Element, field: FieldProperties) => {
  let element: Element | null = null;
  element = root.querySelector(field.selector);
  if (
    field.dataType === FIELD_DATA_TYPES.IMAGE ||
    field.dataType === FIELD_DATA_TYPES.VIDEO ||
    field.dataType === FIELD_DATA_TYPES.AUDIO
  ) {
    if (
      element &&
      (element instanceof HTMLImageElement ||
        element instanceof HTMLVideoElement ||
        element instanceof HTMLAudioElement) &&
      element.src
    ) {
      return element.src;
    } else {
      return 'Image source not found or element is not an media element(img, video, audio)';
    }
  } else {
    if (element && element.textContent) {
      return element.textContent;
    } else {
      return 'Content does not exist';
    }
  }
};

export const getExtractedFromPage = (scanRules: ScanRule[]) => {
  const res: ExtractedInfos = {};
  scanRules.forEach((scanRule, idx) => {
    res[idx] = [];
    if (!checkUrlMatched(scanRule)) {
      let roots = Array.from(document.querySelectorAll(scanRule.rootTag));
      if (roots.length === 0) roots = Array.from(document.querySelectorAll('body'));
      roots.forEach((root) => {
        const extracteds: ExtractedFields = {};
        for (const fieldName of Object.keys(scanRule.fields)) {
          extracteds[fieldName] = extractFields(root, scanRule.fields[fieldName]);
        }
        res[idx].push(extracteds);
      });
    }
  });
  return res;
};

chrome.runtime.onMessage.addListener(messageHandler);
