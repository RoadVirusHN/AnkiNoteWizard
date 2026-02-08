import { Template } from '@/front/utils/useTemplates';
import { Message, MessageType } from '../background/messageHandler';
import { getExtractedFromPage } from './content';
import { activateInspectionMode, deactivateInspectionMode, InspectionMode } from './tagExtraction';
import { PortNames } from '../background/connectHandler';

export const messageHandler = async (
  message: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void
) => {
  let isAsync = false;
  console.log('Content script received message:', message);
  switch (message.type) {
    case MessageType.REQUEST_DETECTED_CARDS_TO_CONTENT:
      console.log('Received REQUEST_DETECTED_CARDS_TO_CONTENT message');
      sendResponse(getExtractedFromPage(message.data as Template[]));
      break;
    case MessageType.ENTER_INSPECTION_MODE_FROM_PANEL:
      console.log('Enter inspect mode requested: ' + message.data);
      const port = chrome.runtime.connect({ name: PortNames.READY_INSPECTION_MODE_FROM_CONTENT });
      port.onDisconnect.addListener(() => {
        deactivateInspectionMode();
      });
      activateInspectionMode(message.data as InspectionMode, port);
      break;
  }
  return isAsync;
};

// (message) => {
//   console.log('Message received from content.js :', message);
//   if (message.type === MessageType.REQUEST_DETECTED_CARDS_FROM_PANEL) {
//     console.log('Received EXTRACT_DATA_REQUEST message');
//     sendDetectedCards(message.customCards);
//   } else if (message.type === MessageType.ENTER_INSPECT_MODE) {
//     console.log("request OverlayMode" + message.mode);
//     activateInspectionMode(message.mode);
//   } else if (message.type === MessageType.EXIT_INSPECT_MODE) {
//     console.log("request unset OverlayMode");
//     deactivateInspectionMode();
//   } else {
//     console.log("wtf");
//   }
// });
