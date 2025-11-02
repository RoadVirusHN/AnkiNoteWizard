import { Extracted, IdxedExtracted } from '@/front/components/pages/Cards/CardPage';
import { CardFieldDataType, CardFieldSelectorType, CustomCard } from '@/front/utils/useCustomCard';

//TODO : Make Message Types Constant Enum
console.log('✅ Content script loaded');
let customCards: CustomCard[] = [];
window.onload = () => {
  console.log('Content script window.onload fired');
  const res = getExtractedFromPage(customCards);
  console.log('Extracted data on window.onload:', res);
  chrome.runtime.sendMessage({
    type: 'SEND_DETECTED_CARDS',
    extracteds: res,
    URL: window.location.href,
  });
};

console.log('Current url is ', window.location.href);
const getExtractedFromPage = (customCards: CustomCard[]): IdxedExtracted[] => {
  const res = customCards
    .filter((card) => {
      if (card.urlPatterns.length === 0) return false;
      else if (
        card.urlPatterns.some((pattern) => {
          // use wildcard to match urlPattern
          const regex = new RegExp(
            '^' +
              pattern
                .split('*')
                .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
                .join('.*') +
              '$'
          );
          return regex.test(window.location.href);
        })
      ) {
        return true;
      }
    })
    .map((card, customCardIndex) => {
      const extracted: Extracted = {
        Front: {},
        Back: {},
      };
      // Front 필드 추출
      card.Front.fields.forEach((field) => {
        try {
          let element: Element | null = null;
          if (field.selectorType === CardFieldSelectorType.CSSSelector) {
            element = document.querySelector(field.content);
          }

          if (element) {
            switch (field.dataType) {
              case CardFieldDataType.TEXT:
                extracted.Front[field.name] = element.textContent || '';
                break;
              case CardFieldDataType.IMAGE:
                if (element instanceof HTMLImageElement) {
                  extracted.Front[field.name] = element.src;
                } else {
                  extracted.Front[field.name] = (element as HTMLElement).getAttribute('src') || '';
                }
                break;
              case CardFieldDataType.AUDIO:
                extracted.Front[field.name] = (element as HTMLAudioElement).src || '';
                break;
              default:
                extracted.Front[field.name] = element.textContent || '';
            }
          } else {
            extracted.Front[field.name] = 'Content does not exist : ' + field.content;
          }
        } catch (e) {
          console.warn(`Failed to extract front field ${field.name}`, e);
        }
      });
      // Back 필드 추출
      card.Back.fields.forEach((field) => {
        try {
          let element: Element | null = null;
          if (field.selectorType === CardFieldSelectorType.CSSSelector) {
            element = document.querySelector(field.content);
          }

          if (element) {
            switch (field.dataType) {
              case CardFieldDataType.TEXT:
                extracted.Back[field.name] = element.textContent || '';
                break;
              case CardFieldDataType.IMAGE:
                if (element instanceof HTMLImageElement) {
                  extracted.Back[field.name] = element.src;
                } else {
                  extracted.Back[field.name] = (element as HTMLElement).getAttribute('src') || '';
                }
                break;
              case CardFieldDataType.AUDIO:
                extracted.Back[field.name] = (element as HTMLAudioElement).src || '';
                break;
              default:
                extracted.Back[field.name] = element.textContent || '';
            }
          } else {
            extracted.Back[field.name] = 'Content does not exist : ' + field.content;
          }
        } catch (e) {
          console.warn(`Failed to extract back field ${field.name}`, e);
        }
      });
      return { customCardIndex, extracted };
    });
  return res;
};
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'REQUEST_DETECTED_CARDS') {
    console.log('Received EXTRACT_DATA_REQUEST message');
    // 여기서 데이터 추출 로직을 수행
    customCards = message.customCards;
    const extractedData = getExtractedFromPage(customCards);
    // 추출된 데이터를 백그라운드 스크립트로 전송
    chrome.runtime.sendMessage({
      type: 'SEND_DETECTED_CARDS',
      data: extractedData,
      url: window.location.href,
    });
    console.log('Sent EXTRACTED_DATA_RESPONSE message', extractedData);
  }
});
