export const onInstalled = () => {
  // TODO: setting default template.
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
