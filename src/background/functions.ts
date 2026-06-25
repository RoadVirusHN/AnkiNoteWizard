import useConfigure from '@/panel/stores/useConfigure';
import useScanRule from '@/panel/stores/useScanRule';
import { defaultScanRules } from './constants';
import { LOCALE, THEME_SETTING } from '@/types/app.types';

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
  sendResponse: (response?: unknown) => void
) => {
  try {
    const tabId = await getCurrentTabId();
    console.log('tabId:', tabId);

    if (tabId === undefined) {
      sendResponse({ error: 'No Active tab found' });
      return;
    }
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Content Script Error:', chrome.runtime.lastError.message);
        sendResponse({ res:'error', error: chrome.runtime.lastError.message });
      } else {
        console.log('Response from content script (Valid):', response);
        sendResponse(response);
      }
    });
  } catch (error) {
    console.error('Background Error:', error);
    sendResponse({ error: 'Background script error' });
    
  }
};
