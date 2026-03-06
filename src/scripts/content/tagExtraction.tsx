import { createRoot, Root } from "react-dom/client";
import App from "@/content/App";
import { CssSelectorGeneratorOptionsInput } from "css-selector-generator/types/types";
import { EXTENSION_UI_ID, InspectionMode } from "./constants";

let root : Root;
let contentPort: chrome.runtime.Port | null = null; // 포트 연결 상태 관리;
// -----------------------------------------------------------------------------
// 2. UI 생성 로직 (Overlay, Tooltip, Menu)
// -----------------------------------------------------------------------------
function createUIComponents(inspectionMode: InspectionMode, port: chrome.runtime.Port, cssSelectorOptions: CssSelectorGeneratorOptionsInput) {
  if (document.getElementById(EXTENSION_UI_ID)) return;
  const container = document.createElement('div');
  
  chrome.storage.sync.get('anki-card-wizard-configure-store', (result) => {
    const store = result['anki-card-wizard-configure-store'];
    if (store && store.state){
      if (store.state.themeOption) {
        const theme = store.state.themeOption.theme;
        console.log(store.state.themeOption, theme);
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

  root = createRoot(container);
  document.body.appendChild(container);
  root.render(<App mode={inspectionMode} port={port} cssSelectorOptions={cssSelectorOptions} deactivate={deactivateInspectionMode}/>); // React 앱 렌더링
}

export const activateInspectionMode = (mode: InspectionMode = InspectionMode.TEXT_EXTRACTION, port: chrome.runtime.Port, cssSelectorOptions: CssSelectorGeneratorOptionsInput) => {
  console.log(`Activate InspectionMode: ${mode}`);
  createUIComponents(mode, port, cssSelectorOptions); // UI 준비
  contentPort = port;
};

export const deactivateInspectionMode = () => {
  console.log('DeActivate InspectionMode');
  root.unmount();
  if(document.getElementById(EXTENSION_UI_ID)) document.getElementById(EXTENSION_UI_ID)?.remove();
  contentPort?.disconnect();
};
