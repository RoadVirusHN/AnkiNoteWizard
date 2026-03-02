import {
  TemplateField,
  TemplateFieldDataType,
  Template,
  ExtractedMap,
  Extracted,
} from '@/front/utils/useTemplates';
import { messageHandler } from './messageHandler';
import i18n from '@/front/locales/i18n';
import { initReactI18next } from 'react-i18next';
import enTranslations from '@/front/locales/en.json';
import koTranslations from '@/front/locales/ko.json';

console.log('✅ Content script loaded');
export const initLocale = () =>{
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

const checkUrlMatched = (customCard: Template): boolean => {
  customCard.urlPatterns = customCard.urlPatterns || ['body'];
  return (
    // use wildcard to match urlPattern
    customCard.urlPatterns.some((pattern) => {
      const patternHost = pattern
        .replace(/^https?:\/\/(www\.)?/, '')
        .split('/')[0];

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
const extractFields = (root: Element, record: Record<string, string>) => (field: TemplateField) => {
  try {
    let element: Element | null = null;
    element = root.querySelector(field.content);

    if (element) {
      switch (field.dataType) {
        case TemplateFieldDataType.TEXT:
          record[field.name] = element.textContent || '';
          break;
        case TemplateFieldDataType.IMAGE:
          if (element instanceof HTMLImageElement) {
            record[field.name] = element.src;
          } else {
            record[field.name] = (element as HTMLElement).getAttribute('src') || '';
          }
          break;
        case TemplateFieldDataType.AUDIO:
          record[field.name] = (element as HTMLAudioElement).src || '';
          break;
        default:
          record[field.name] = element.textContent || '';
      }
    } else {
      record[field.name] = field.isOptional ? '' : 'Content does not exist : ' + field.name;
    }
  } catch (e) {
    console.warn(`Failed to extract field ${field.name}`, e);
  }
};
export const getExtractedFromPage = (customCards: Template[]): [ExtractedMap, number] => {
  const res: ExtractedMap = {};
  let cnt = 0;
  customCards.filter(checkUrlMatched).forEach((card, idx) => {
    const extracteds: Extracted[] = [];
    let roots = Array.from(document.querySelectorAll(card.rootTag));
    if (roots.length === 0) roots = Array.from(document.querySelectorAll('body'));
    roots.forEach((root) => {
      const extracted: Extracted = {
        Front: {},
        Back: {},
      };
      // Front 필드 추출
      //TODO : strict mode : if there is no field info founded, discard it.
      card.Front.fields.forEach(extractFields(root, extracted.Front));
      // Back 필드 추출
      card.Back.fields.forEach(extractFields(root, extracted.Back));
      extracteds.push(extracted);
      cnt++;
    });
    res[idx] = extracteds;
  });
  return [res, cnt];
};

chrome.runtime.onMessage.addListener(messageHandler);

