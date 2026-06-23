import { Message, MESSAGE_TYPE } from '@/types/chrome.types';
import { STORAGE_KEY } from './constants';
import { sendAsyncMessage } from './functions';

export const messageHandler = (
  message: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void
) => {
  console.log('Background received message:', message);

  // 비동기 처리가 필요한 경우를 위한 플래그
  let shouldKeepChannelOpen = false;

  switch (message.type) {
    case MESSAGE_TYPE.REQUEST_DRAFTS_FROM_CONTENT:
      shouldKeepChannelOpen = true;
      (async () => {
        try {
          const response = await chrome.storage.local.get(STORAGE_KEY);
          const drafts = response['drafts'] || [];
          sendResponse({ drafts });
        } catch (e) {
          sendResponse({ error: e });
        }
      })();
      break;

    case MESSAGE_TYPE.REQUEST_DETECTED_DRAFTS_FROM_PANEL:
      console.log('Received REQUEST_DETECTED_CARDS_FROM_PANEL message', message);
      shouldKeepChannelOpen = true;
      sendAsyncMessage<Message>(
        { type: MESSAGE_TYPE.REQUEST_DETECTED_DRAFTS_TO_CONTENT, data: message.data },
        sendResponse
      );
      break;
}

  return shouldKeepChannelOpen;
};
