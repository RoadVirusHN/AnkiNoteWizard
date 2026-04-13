import { STORAGE_KEY } from './constants';
import { sendAsyncMessage } from './functions';
import { Message, MessageType } from 'types/chrome.types';

export const messageHandler = (
  message: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void
) => {
  console.log('Background received message:', message);

  // 비동기 처리가 필요한 경우를 위한 플래그
  let shouldKeepChannelOpen = false;

  switch (message.type) {
    case MessageType.REQUEST_CUSTOMCARDS_FROM_CONTENT:
      shouldKeepChannelOpen = true;
      (async () => {
        try {
          const response = await chrome.storage.local.get(STORAGE_KEY);
          const customCards = response['customCards'] || [];
          sendResponse({ customCards });
        } catch (e) {
          sendResponse({ error: e });
        }
      })();
      break;

    case MessageType.REQUEST_DETECTED_CARDS_FROM_PANEL:
      console.log('Received REQUEST_DETECTED_CARDS_FROM_PANEL message');
      shouldKeepChannelOpen = true;
      sendAsyncMessage<Message>(
        { type: MessageType.REQUEST_DETECTED_CARDS_TO_CONTENT, data: message.data },
        sendResponse
      );
      break;
}

  return shouldKeepChannelOpen;
};
