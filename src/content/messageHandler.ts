import { getExtractedFromPage } from './content';
import { activateInspectionMode, deactivateInspectionMode } from './tagExtraction';
import { CssSelectorGeneratorOptionsInput } from 'css-selector-generator/types/types';
import { ScanRule } from '@/types/scanRule.types';
import { InspectionMode } from '@/types/app.types';
import { Message, MESSAGE_TYPE, PORT_NAMES } from '@/types/chrome.types';

export const messageHandler = async (
  message: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void
) => {
  let isAsync = false;
  console.log('Content script received message:', message);
  switch (message.type) {
    case MESSAGE_TYPE.REQUEST_DETECTED_CARDS_TO_CONTENT:
      console.log('Received REQUEST_DETECTED_CARDS_TO_CONTENT message');
      sendResponse(getExtractedFromPage(message.data as ScanRule[]));
      break;
    case MESSAGE_TYPE.ENTER_INSPECTION_MODE_FROM_PANEL:
      console.log('Enter inspect mode requested: ' + message.data);
      const port = chrome.runtime.connect({ name: PORT_NAMES.READY_INSPECTION_MODE_FROM_CONTENT });
      port.onDisconnect.addListener(() => {
        deactivateInspectionMode();
      });
      const { mode, rootSelector, cssSelectorOptions } = message.data as {
        mode: InspectionMode;
        rootSelector: string;
        cssSelectorOptions: CssSelectorGeneratorOptionsInput;
      };
      activateInspectionMode(mode, port, {
        ...cssSelectorOptions,
        root: document.querySelector(rootSelector) || document.body,
      });
      break;
  }
  return isAsync;
};
