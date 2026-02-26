import { InspectionMode } from '../content/tagExtraction';
import { MessageType } from './messageHandler';

const sidePanelPorts = {} as { [tabId: number]: chrome.runtime.Port};
const portTabMap = new WeakMap<chrome.runtime.Port, number>();
const contentScriptPorts = {} as { [tabId: number]: chrome.runtime.Port };

export enum PortNames {
  ENTER_TEXT_INSPECTION_MODE_FROM_PANEL = 'ENTER_TEXT_INSPECTION_MODE_FROM_PANEL',
  ENTER_TAG_INSPECTION_MODE_FROM_PANEL = 'ENTER_TAG_INSPECTION_MODE_FROM_PANEL',
  ENTER_FIELD_INSPECTION_MODE_FROM_PANEL = 'ENTER_FIELD_INSPECTION_MODE_FROM_PANEL',
  READY_INSPECTION_MODE_FROM_CONTENT = 'READY_INSPECTION_MODE_FROM_CONTENT',
}
const portNameToInspectionMode = {
  [PortNames.ENTER_TEXT_INSPECTION_MODE_FROM_PANEL]: InspectionMode.TEXT_EXTRACTION,
  [PortNames.ENTER_TAG_INSPECTION_MODE_FROM_PANEL]: InspectionMode.TAG_EXTRACTION,
  [PortNames.ENTER_FIELD_INSPECTION_MODE_FROM_PANEL]: InspectionMode.FIELD_EXTRACTION,
};

export const connectHandler = (port: chrome.runtime.Port) => {
  console.log("Background received connection on port:", port.name);
  switch (port.name) {
    case PortNames.ENTER_TEXT_INSPECTION_MODE_FROM_PANEL:
    case PortNames.ENTER_TAG_INSPECTION_MODE_FROM_PANEL:
    case PortNames.ENTER_FIELD_INSPECTION_MODE_FROM_PANEL:
      port.onMessage.addListener((msg) => {
        const tabId = msg.tabId as number;
        console.log("background get message", msg);
        switch (msg.type) {
          case MessageType.SET_INSPECTION_TAB_ID:
            if (sidePanelPorts[tabId] !== undefined) {
              sidePanelPorts[tabId].disconnect();
            }
            sidePanelPorts[tabId] = port;
            chrome.tabs.sendMessage(tabId, {
              type: MessageType.ENTER_INSPECTION_MODE_FROM_PANEL,
              data: portNameToInspectionMode[port.name as keyof typeof portNameToInspectionMode],
              rootSelector: msg.rootSelector,
            });
            portTabMap.set(port, tabId); // Store tabId in the port object
            break;
          default:
            contentScriptPorts[tabId].postMessage(msg);
          }
      });
      port.onDisconnect.addListener(() => {
        console.log("panel request port disconnection");
        // TODO : Add Common Disconnect Handler to execute both handler
        // port.onDisconnect는 오직 반대편에서 disconnect를 호출했을 때만 실행된다.
        const tabId = portTabMap.get(port);
        if (tabId !== undefined) {
          contentScriptPorts[tabId].disconnect();
          // Clean up the mapping on disconnect
          delete sidePanelPorts[tabId];
          delete contentScriptPorts[tabId];
          portTabMap.delete(port);
        }
      });
      break;
    case PortNames.READY_INSPECTION_MODE_FROM_CONTENT:
      if (port.sender === undefined || port.sender.tab?.id === undefined) {
        console.error('Port sender or tab ID is undefined');
        return;
      } else {
        contentScriptPorts[port.sender.tab.id] = port;
        port.onMessage.addListener((msg) => {
          const tabId = port.sender!.tab!.id!;
          sidePanelPorts[tabId].postMessage(msg);
        });
        port.onDisconnect.addListener(() => {
          console.log("content request port disconnection");
          // TODO : Add Common Disconnect Handler to execute both handler
          const tabId = port.sender!.tab!.id!;
          sidePanelPorts[tabId].disconnect();
          // Clean up the mapping on disconnect
          portTabMap.delete(sidePanelPorts[tabId]);
          delete sidePanelPorts[tabId];
          delete contentScriptPorts[tabId];
        });
      }
      break;
  }
};
