import { Extracted, ExtractedMap } from '@/front/pages/Detect/DetectPage';
import {
  TemplateField,
  TemplateFieldDataType,
  Template,
} from '@/front/utils/useTemplates';
import { STORAGE_KEY } from '../background/constants';

//TODO : Make Message Types Constant Enum
//TODO : Delayed search for Delayed Content delivery
console.log('✅ Content script loaded');
let customCards: Template[] = [];
window.onload = async () => {
  const response = await chrome.storage.local.get(STORAGE_KEY);
  customCards = response['customCards'] || [];
  // chrome.runtime.sendMessage({ type: 'REQUEST_CUSTOM_CARDS_FROM_BACKGROUND' });
  console.log('Content script window.onload fired', customCards);
  sendDetectedCards(customCards);
};

const checkUrlMatched = (customCard: Template): boolean => {
  customCard.urlPatterns = customCard.urlPatterns || ['body'];
  return (
    // use wildcard to match urlPattern
    customCard.urlPatterns.some((pattern) => {
      const regex = new RegExp(
        '^' + pattern
          .split('*')
          .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
          .join('.*') + '$'
      );
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

const getExtractedFromPage = (customCards: Template[]): [ExtractedMap, number] => {
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
const sendDetectedCards = (customCards: Template[]) => {
  const [extractedData, cnt] = getExtractedFromPage(customCards);
  // 추출된 데이터를 백그라운드 스크립트로 전송
  chrome.runtime.sendMessage({
    type: 'SEND_DETECTED_CARDS',
    cnt,
    data: extractedData,
    url: window.location.href,
  });
};
chrome.runtime.onMessage.addListener((message) => {
  console.log('Message received from content.js :', message);
  if (message.type === 'REQUEST_DETECTED_CARDS') {
    console.log('Received EXTRACT_DATA_REQUEST message');
    sendDetectedCards(message.customCards);
  }
});
