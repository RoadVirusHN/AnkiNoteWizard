import { messageHandler } from './messageHandler';
import i18n, { i18nConfig } from '@/locales/i18n';
import { initReactI18next } from 'react-i18next';
import {
  ScanRule,
  FIELD_DATA_TYPES,
  FieldProperties,
  ExtractedInfos,
  ExtractedFields,
} from '@/types/scanRule.types';
import { checkUrlMatched } from './function';

console.log('✅ Content script loaded');
export const initLocale = () => {
  i18n.use(initReactI18next).init(i18nConfig);
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

const extractFields = (root: Element, field: FieldProperties[]) => {
  let res = '';
  field.forEach((fieldProp, idx) => {
    if (fieldProp.selectorType === 'literal') {
      res += fieldProp.content;
      return;
    }
    let element: Element | null = null;
    element = root.querySelector(fieldProp.content);
    if (
      fieldProp.dataType === FIELD_DATA_TYPES.IMAGE ||
      fieldProp.dataType === FIELD_DATA_TYPES.VIDEO ||
      fieldProp.dataType === FIELD_DATA_TYPES.AUDIO
     ) {
    if (
      element &&
      (element instanceof HTMLImageElement ||
        element instanceof HTMLVideoElement ||
        element instanceof HTMLAudioElement) &&
        element.src
      ) {

        switch (fieldProp.dataType) {
          case FIELD_DATA_TYPES.IMAGE:
            res += `<img src='${element.src}' />`;
            break;
          case FIELD_DATA_TYPES.VIDEO:
            res += `<video src='${element.src}' control></video>`;
            break;
          case FIELD_DATA_TYPES.AUDIO:
            res += `<audio src='${element.src}' control></audio>`;
            break;
        }
      } else {
        res += `{{Field Prop ${idx} has no src attribute or is not a media element}}`;
      }
    } else if (fieldProp.dataType === FIELD_DATA_TYPES.TEXT) {
      if (element && element.textContent) {
        res += element.textContent;
      } else {
        res += `Field Prop ${idx} does not exist or has no text content`;
      }
    } else {
      if (element) {
        res += element.innerHTML;
      } else {
        res += `Field Prop ${idx} does not exist or has no innerHTML content`;
      }
    }
  });
  return res;
};

export const getExtractedFromPage = (scanRules: ScanRule[]) => {
  const res: ExtractedInfos = {};
  scanRules.forEach((scanRule, idx) => {
    res[idx] = [];
    console.log("url Matching: ",scanRule.urlPattern,checkUrlMatched(scanRule.urlPattern));
    if (checkUrlMatched(scanRule.urlPattern)) {
      let roots = Array.from(document.querySelectorAll(scanRule.rootTagSelector));
      console.log(roots);
      if (roots.length === 0) roots = Array.from(document.querySelectorAll('body'));
      roots.forEach((root) => {
        const extracteds: ExtractedFields = {};
        for (const fieldName of Object.keys(scanRule.fields)) {
          extracteds[fieldName] = extractFields(root, scanRule.fields[fieldName]);
        }
        res[idx].push(extracteds);
        console.log(extracteds);
      });
    }
  });
  console.log('request result', res);
  return res;
};

chrome.runtime.onMessage.addListener(messageHandler);
