import { MessageType } from "./messageHandler";

const sidePanelPorts = {} as { [tabId: number]: chrome.runtime.Port };
const contentScriptPorts = {} as { [tabId: number]: chrome.runtime.Port };

export enum PortNames {
  ENTER_INSPECTION_MODE_FROM_PANEL = "ENTER_INSPECTION_MODE_FROM_PANEL",
  READY_INSPECTION_MODE_FROM_CONTENT = "READY_INSPECTION_MODE_FROM_CONTENT",
}

export const connectHandler = (port: chrome.runtime.Port) => {
  switch (port.name) {
    case PortNames.ENTER_INSPECTION_MODE_FROM_PANEL:
      if (port.sender === undefined || port.sender.tab?.id === undefined) {
        console.error("Port sender or tab ID is undefined");
        return;
      } else {
        sidePanelPorts[port.sender.tab.id] = port;
        chrome.tabs.sendMessage(port.sender.tab.id, {type: MessageType.ENTER_INSPECTION_MODE_FROM_PANEL});
        port.onMessage.addListener((msg) => {
          if (port.sender === undefined || port.sender.tab?.id === undefined) {
            console.error("Port sender or tab ID is undefined");
            return;
          } 
          contentScriptPorts[port.sender.tab.id].postMessage(msg);
        });
      }
      break;
    case PortNames.READY_INSPECTION_MODE_FROM_CONTENT:
      if (port.sender === undefined || port.sender.tab?.id === undefined) {
        console.error("Port sender or tab ID is undefined");
        return;
      } else {
        contentScriptPorts[port.sender.tab.id] = port;
        port.onMessage.addListener((msg) => {
          if (port.sender === undefined || port.sender.tab?.id === undefined) {
            console.error("Port sender or tab ID is undefined");
            return;
          } 
          sidePanelPorts[port.sender.tab.id].postMessage(msg);
        });
      }
      break;
  }  
};