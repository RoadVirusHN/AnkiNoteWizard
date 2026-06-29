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

export const sendAsyncMessage = async <T>(
  message: T,
  sendResponse: (response?: Response) => void
) => {
  try {
    const tabId = await getCurrentTabId();
    console.log('tabId:', tabId);

    if (tabId === undefined) {
      sendResponse({ res:'error',error: 'No Active tab found',response:null });
      return;
    }
    chrome.tabs.sendMessage(tabId, message, (response : Response) => {
      if (chrome.runtime.lastError) {
        console.error('Content Script Error:', chrome.runtime.lastError.message);
        sendResponse({ res:'error', error: chrome.runtime.lastError.message??null, response: null });
      } else {
        console.log('Response from content script (Valid):', response);
        sendResponse({res:'ok', error:null, response: response.response});
      }
    });
  } catch (error) {
    console.error('Background Error:', error);
    sendResponse({ res:'error', error: 'Background script error', response:null });
    
  }
};
