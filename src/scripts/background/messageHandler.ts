import { STORAGE_KEY } from './constants';
import { getCurrentTabId } from './functions';

export interface Message {
  type: MessageType;
  data: unknown;
}
export enum MessageType {
  REQUEST_CUSTOMCARDS_FROM_CONTENT = 'REQUEST_CUSTOMCARDS_FROM_CONTENT',
  SEND_DETECTED_CARDS = 'SEND_DETECTED_CARDS',
  REQUEST_DETECTED_CARDS_FROM_PANEL = 'REQUEST_DETECTED_CARDS_FROM_PANEL',
  REQUEST_DETECTED_CARDS_TO_CONTENT = 'REQUEST_DETECTED_CARDS_TO_CONTENT',
  ENTER_INSPECT_MODE = 'ENTER_INSPECT_MODE',
  EXIT_INSPECT_MODE = 'EXIT_INSPECT_MODE',
  SEND_INSPECT_DATA = 'SEND_INSPECT_DATA',
}

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
      // 내부에서 async 로직 실행
      (async () => {
        try {
          const response = await chrome.storage.local.get(STORAGE_KEY);
          const customCards = response['customCards'] || [];
          sendResponse({ customCards });
        } catch (e) {
          sendResponse({ error: e});
        }
      })();
      break;

    case MessageType.REQUEST_DETECTED_CARDS_FROM_PANEL:
      console.log('Received REQUEST_DETECTED_CARDS_FROM_PANEL message');
      shouldKeepChannelOpen = true; // ⭐️ 핵심 2: 채널 유지를 위해 true로 설정

      // 내부에서 별도의 async 스코프를 엽니다.
      (async () => {
        try {
          const tabId = await getCurrentTabId();
          console.log('tabId:', tabId);

          if (tabId === undefined) {
            sendResponse({ error: "No Active tab found" });
            return;
          }

          // Content Script로 메시지 전송
          chrome.tabs.sendMessage(
            tabId,
            { type: MessageType.REQUEST_DETECTED_CARDS_TO_CONTENT, data: message.data },
            (response) => {
              // ⭐️ 핵심 3: 여기서 오류 체크 후 sendResponse 호출
              if (chrome.runtime.lastError) {
                console.error("Content Script Error:", chrome.runtime.lastError.message);
                sendResponse({ error: chrome.runtime.lastError.message });
              } else {
                console.log('Response from content script (Valid):', response);
                // Content Script에서 받은 데이터를 그대로 Side Panel로 전달
                sendResponse(response); 
              }
            }
          );
        } catch (error) {
          console.error("Background Error:", error);
          sendResponse({ error: "Background script error" });
        }
      })();
      break;
  }

  // ⭐️ 핵심 4: 동기적으로 true를 반환하여 비동기 응답을 기다리겠다고 선언
  return shouldKeepChannelOpen;
};