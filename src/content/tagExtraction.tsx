import { createRoot, Root } from "react-dom/client";
import App from "@/content/ui/App";
import { EXTENSION_UI_ID } from "./constants";
import { INSPECTION_MODE, InspectionMode } from "@/types/app.types";
let appRoot : Root;
let contentPort: chrome.runtime.Port | null = null; // 포트 연결 상태 관리;
// -----------------------------------------------------------------------------
// 2. UI 생성 로직 (Overlay, Tooltip, Menu)
// -----------------------------------------------------------------------------
function createUIComponents(inspectionMode: InspectionMode, port: chrome.runtime.Port, rootTag: string) {
  if (document.getElementById(EXTENSION_UI_ID)) return;
  const container = document.createElement('div');
  
  chrome.storage.sync.get('anki-card-wizard-configure-store', (result) => {
    const store = result['anki-card-wizard-configure-store'];
    if (store && store.state){
      if (store.state.themeOption) {
        const theme = store.state.themeOption.theme;
        container.setAttribute('data-theme', theme);
      }
      if (store.state.fontSize) {
        const fontSize = store.state.fontSize;
        container.classList.add(`font-${fontSize}`);
      }
    } 
    
  });

  container.id = EXTENSION_UI_ID;
  Object.assign(container.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '999999'
  });

  appRoot = createRoot(container);
  document.body.appendChild(container);
  console.log("rootTags : ", Array.from(document.querySelectorAll(rootTag)));
  appRoot.render(<App mode={inspectionMode} port={port} roots={Array.from(document.querySelectorAll(rootTag))} deactivate={deactivateInspectionMode}/>); // React 앱 렌더링
}

export const activateInspectionMode = (mode: InspectionMode = INSPECTION_MODE.TEXT_EXTRACTION, port: chrome.runtime.Port, rootTag: string) => {
  console.log(`Activate InspectionMode: ${mode}`);
  createUIComponents(mode, port, rootTag); // UI 준비
  contentPort = port;
};

export const deactivateInspectionMode = () => {
  console.log('DeActivate InspectionMode');
  appRoot.unmount();
  if(document.getElementById(EXTENSION_UI_ID)) document.getElementById(EXTENSION_UI_ID)?.remove();
  contentPort?.disconnect();
};
