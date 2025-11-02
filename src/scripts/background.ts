console.log('✅ Background script loaded');
const STORAGE_KEY = 'anki-card-wizard-global-var-store';
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed!');
});
let popupWindowId: number | null = null;

chrome.action.onClicked.addListener(async () => {
  if (popupWindowId !== null) {
    try {
      const existingWindow = await chrome.windows.get(popupWindowId);
      console.log(existingWindow);
      if (existingWindow) {
        chrome.windows.update(popupWindowId, { focused: true });
        return;
      }
    } catch (e) {
      // 창이 없으면 오류가 발생하므로 무시
      console.log('Previous popup window not found, opening a new one.' + e);
      popupWindowId = null;
    }
  }
  try {
    const data = await chrome.storage.local.get(STORAGE_KEY);
    const raw = data[STORAGE_KEY];
    // raw는 persist가 저장한 값(보통 JSON 문자열 또는 오브젝트)일 수 있음.
    // Zustand+persist로 저장한 모양에 따라 값을 꺼내는 로직을 맞춰야 함.
    // 예: createJSONStorage(() => chromeStorage) 형태일 때 raw는 이미 파싱된 객체일 가능성 있음.
    let initialTab = null;
    if (raw) {
      try {
        // raw가 문자열이면 parse
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        // parsed.state.currentTab 또는 구조에 따라 찾기
        initialTab = parsed?.state?.currentTab ?? parsed?.currentTab;
      } catch (e) {
        console.warn('Failed to parse persisted store', e);
      }
    }

    // 기본 경로
    let route = 'card'; // index -> CardPage
    if (initialTab === 'HISTORY') route = 'history';
    else if (initialTab === 'CUSTOM') route = 'custom';
    else if (initialTab === 'CONFIG') route = 'config';
    const url = chrome.runtime.getURL(`index.html#/${route}`);
    const newWindow = await chrome.windows.create({ url, type: 'popup', width: 480, height: 320 });
    popupWindowId = newWindow?.id ?? null;
  } catch (err) {
    console.error('Failed to open window with saved route, opening default', err);
    const url = chrome.runtime.getURL('index.html');
    chrome.windows.create({ url, type: 'popup', width: 480, height: 320 });
  }
});
let popupModalWindowId: number | null = null;
chrome.runtime.onMessage.addListener(async (message) => {
  console.log(message);
  switch (message.type) {
    case 'OPEN_MODIFY_CUSTOM_CARD_MODAL':
      if (popupModalWindowId !== null) {
        chrome.windows.remove(popupModalWindowId);
      } 
      const url = chrome.runtime.getURL(
        'index.html#/modify-custom-card' + (message.index !== undefined ? '/' + message.index : '')
      );
      const opened = await chrome.windows.create({ url, type: 'popup', width: 800, height: 600 });
      popupModalWindowId = opened?.id ?? null;
      break;
    case 'CLOSE_MODIFY_CUSTOM_CARD_MODAL':
      if (popupModalWindowId !== null) {
        chrome.windows.remove(popupModalWindowId);
        popupModalWindowId = null;
      }
      break;
  }
});

chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === popupWindowId) {
    popupWindowId = null;
    if (popupModalWindowId !== null) {
      chrome.windows.remove(popupModalWindowId);
      popupModalWindowId = null;
    }
  }
});
