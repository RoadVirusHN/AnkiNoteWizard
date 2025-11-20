console.log('✅ Background script loaded');
//const STORAGE_KEY = 'anki-card-wizard-global-var-store';
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed!');
});
// TODO : change window -> side panel app
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => {
  console.error('Error setting side panel behavior:', error);
});

chrome.runtime.onMessage.addListener(async (message) => {
  console.log(message);
  switch (message.type) {
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
