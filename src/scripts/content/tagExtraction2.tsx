import { createRoot, Root } from "react-dom/client";
import App from "@/content/App";

let root : Root;
let contentPort: chrome.runtime.Port | null = null; // 포트 연결 상태 관리;

export enum InspectionMode {
  TAG_EXTRACTION = 'TAG_EXTRACTION',
  TEXT_EXTRACTION = 'TEXT_EXTRACTION',
}

export const EXTENSION_UI_ID = 'extension-ui-container';

// -----------------------------------------------------------------------------
// 2. UI 생성 로직 (Overlay, Tooltip, Menu)
// -----------------------------------------------------------------------------
function createUIComponents(inspectionMode: InspectionMode, port: chrome.runtime.Port) {
  if (document.getElementById(EXTENSION_UI_ID)) return;
  const container = document.createElement('div');
  
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
  root.render(<App mode={inspectionMode} port={port}/>); // React 앱 렌더링
}

// 활성화 시 모드를 인자로 받을 수 있도록 변경 (default: TEXT)
export const activateInspectionMode = (mode: InspectionMode = InspectionMode.TEXT_EXTRACTION, port: chrome.runtime.Port) => {
  console.log(`Activate InspectionMode: ${mode}`);
  createUIComponents(mode, port); // UI 준비
  contentPort = port;
};

export const deactivateInspectionMode = () => {
  console.log('DeActivate InspectionMode');
  root.unmount();
  if(document.getElementById(EXTENSION_UI_ID)) document.getElementById(EXTENSION_UI_ID)?.remove();
  contentPort?.disconnect();
};
