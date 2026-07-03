import useConfigure from '@/panel/stores/useConfigure';
import useScanRule from '@/panel/stores/useScanRule';
import { defaultScanRules } from './constants';
import { LOCALE, THEME_SETTING } from '@/types/app.types';
import { Response } from '@/types/chrome.types';

export const onInstalled = () => {
  if (!useConfigure.getState().locale) {
    const uiLanguage = chrome.i18n.getUILanguage();
    const defaultLang = uiLanguage.startsWith('ko') ? LOCALE.KO : LOCALE.EN;
    console.log('Detected UI Language:', uiLanguage, 'Setting default language to:', defaultLang);
    useConfigure.getState().setLocale(defaultLang);
    console.log('Extension installed or updated. Default language set to:', useConfigure.getState().locale);
  }
  if (!useConfigure.getState().themeOption) {
    useConfigure.getState().setThemeSetting(THEME_SETTING.NONE);
  }
  if (!useConfigure.getState().fontSize) {
    useConfigure.getState().setFontSize('normal');
  }
  for (const scanRule of defaultScanRules) {
    useScanRule.getState().addScanRule(scanRule);
  }
};
export const getCurrentTabId = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab.id;
};

export const sendAsyncMessage = <T>(
  message: T,
  sendResponse: (response?: Response) => void
) => {
  // 프로미스 처리는 내부에서 .then() 스케줄러로 처리하여 외부 런타임을 방해하지 않음
  getCurrentTabId()
    .then((tabId) => {
      console.log('tabId:', tabId);

      if (tabId === undefined) {
        sendResponse({ res: 'error', error: 'No Active tab found', response: null });
        return;
      }

      chrome.tabs.sendMessage(tabId, message, (response: Response) => {
        if (chrome.runtime.lastError) {
          console.error('Content Script Error:', chrome.runtime.lastError.message);
          sendResponse({ res: 'error', error: chrome.runtime.lastError.message ?? null, response: null });
        } else {
          console.log('Response from content script (Valid):', response);
          sendResponse(response); // 💡 이제 정상적으로 살아있는 패널의 원래 콜백 컨텍스트로 전달됩니다.
        }
      });
    })
    .catch((error) => {
      console.error('Background Error:', error);
      sendResponse({ res: 'error', error: 'Background script error', response: null });
    });
};
