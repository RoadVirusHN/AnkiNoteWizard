console.log('✅ Background script loaded');
//const STORAGE_KEY = 'anki-card-wizard-global-var-store';
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed!');
});
// TODO : change window -> side panel app
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => {
  console.error('Error setting side panel behavior:', error);
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
    case 'REQUEST_CUSTOM_CARDS_FROM_BACKGROUND':
      {
        const response = await chrome.storage.local.get('anki-card-wizard-custom-cards');
        const customCards = response['anki-card-wizard-custom-cards'] || []; // TODO : WTF?
        chrome.runtime.sendMessage({
          type: 'RESPONSE_CUSTOM_CARDS_FROM_BACKGROUND',
          customCards,
        });
      }
      break;
  }
});
