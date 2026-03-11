import useConfigure, { Language, ThemeSetting } from '@/front/utils/useConfigure';
import useTemplate from '@/front/utils/useTemplates';
import { defaultTemplates } from './constants';

export const onInstalled = () => {
  if (!useConfigure.getState().language) {
    const uiLanguage = chrome.i18n.getUILanguage();
    const defaultLang = uiLanguage.startsWith('ko') ? Language.KO : Language.EN;
    console.log('Detected UI Language:', uiLanguage, 'Setting default language to:', defaultLang);
    useConfigure.getState().setLanguage(defaultLang);
    console.log('Extension installed or updated. Default language set to:', useConfigure.getState().language);
  }
  if (!useConfigure.getState().themeOption) {
    useConfigure.getState().setThemeSetting(ThemeSetting.NONE);
  }
  if (!useConfigure.getState().fontSize) {
    useConfigure.getState().setFontSize('normal');
  }
  for (const template of defaultTemplates) {
    useTemplate.getState().addTemplate(template);
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
    // Content Script로 메시지 전송
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Content Script Error:', chrome.runtime.lastError.message);
        sendResponse({ error: chrome.runtime.lastError.message });
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
