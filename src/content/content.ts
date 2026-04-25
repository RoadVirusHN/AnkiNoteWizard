import { messageHandler } from './messageHandler';
import i18n from '@/locales/i18n';
import { initReactI18next } from 'react-i18next';
import enTranslations from '@/locales/en.json';
import koTranslations from '@/locales/ko.json';
import {
  Extracted,
  ExtractedMap,
  Field,
  ScanRule,
  FIELD_DATA_TYPES,
} from '@/types/scanRule.types';

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
const extractFields = (root: Element, field: Field) => {
  let record: { [item: string]: string } = {};
  try {
    for (const item of field.items) {
      let element: Element | null = null;
      element = root.querySelector(item.content);
      if (element) {
        switch (item.dataType) {
          case FIELD_DATA_TYPES.TEXT:
            record[item.name] = element.textContent || '';
            break;
          case FIELD_DATA_TYPES.IMAGE:
            if (element instanceof HTMLImageElement) {
              record[item.name] = element.src;
            } else {
              record[item.name] = (element as HTMLElement).getAttribute('src') || '';
            }
            break;
          case FIELD_DATA_TYPES.AUDIO:
            record[item.name] = (element as HTMLAudioElement).src || '';
            break;
          default:
            record[field.name] = element.textContent || '';
        }
      } else {
        record[field.name] = item.isOptional ? '' : 'Content does not exist : ' + item.name;
      }
    }
  } catch (e) {
    console.warn(`Failed to extract field ${field.name}`, e);
  }
  return record;
};
export const getExtractedFromPage = (customCards: ScanRule[]): [ExtractedMap, number] => {
  const res: ExtractedMap = {};
  let cnt = 0;
  customCards.filter(checkUrlMatched).forEach((card, idx) => {
    const extracteds: Extracted[] = [];
    let roots = Array.from(document.querySelectorAll(card.rootTag));
    if (roots.length === 0) roots = Array.from(document.querySelectorAll('body'));
    roots.forEach((root) => {
      const extracted: Extracted = {};
      // Front 필드 추출
      //TODO : strict mode : if there is no field info founded, discard it.
      for (const field of card.fields) {
        extracted[field.name] = extractFields(root, field);
      }
      extracteds.push(extracted);
      cnt++;
    });
    res[idx] = extracteds;
  });
  return [res, cnt];
};

chrome.runtime.onMessage.addListener(messageHandler);
