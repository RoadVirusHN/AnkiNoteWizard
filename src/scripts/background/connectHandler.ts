import { InspectionMode } from '../content/tagExtraction';
import { MessageType } from './messageHandler';

const sidePanelPorts = {} as { [tabId: number]: chrome.runtime.Port };
const contentScriptPorts = {} as { [tabId: number]: chrome.runtime.Port };

export enum PortNames {
  ENTER_TEXT_INSPECTION_MODE_FROM_PANEL = 'ENTER_TEXT_INSPECTION_MODE_FROM_PANEL',
  ENTER_TAG_INSPECTION_MODE_FROM_PANEL = 'ENTER_TAG_INSPECTION_MODE_FROM_PANEL',
  READY_INSPECTION_MODE_FROM_CONTENT = 'READY_INSPECTION_MODE_FROM_CONTENT',
}

export const connectHandler = (port: chrome.runtime.Port) => {
  console.log("Background received connection on port:", port.name);
  switch (port.name) {
    case PortNames.ENTER_TEXT_INSPECTION_MODE_FROM_PANEL:
    case PortNames.ENTER_TAG_INSPECTION_MODE_FROM_PANEL:
      port.onMessage.addListener((msg) => {
        const tabId = msg.tabId as number;
        switch (msg.type) {
          case MessageType.SET_INSPECTION_TAB_ID:
            sidePanelPorts[tabId] = port;
            chrome.tabs.sendMessage(tabId, {
              type: MessageType.ENTER_INSPECTION_MODE_FROM_PANEL,
              data:
                port.name === PortNames.ENTER_TEXT_INSPECTION_MODE_FROM_PANEL
                  ? InspectionMode.TEXT_EXTRACTION
                  : InspectionMode.TAG_EXTRACTION,
            });
            break;
          default:
            contentScriptPorts[tabId].postMessage(msg);
          }
      });
      port.onDisconnect.addListener(() => {
        const id = port.sender!.tab!.id!;
        contentScriptPorts[id].disconnect();
      });
      break;
    case PortNames.READY_INSPECTION_MODE_FROM_CONTENT:
      if (port.sender === undefined || port.sender.tab?.id === undefined) {
        console.error('Port sender or tab ID is undefined');
        return;
      } else {
        contentScriptPorts[port.sender.tab.id] = port;
        port.onMessage.addListener((msg) => {
          sidePanelPorts[port.sender!.tab!.id!].postMessage(msg);
        });
        port.onDisconnect.addListener(() => {
          sidePanelPorts[port.sender!.tab!.id!].disconnect();
        });
      }
      break;
  }
};
