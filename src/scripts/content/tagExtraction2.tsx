import { MessageType } from "../background/messageHandler";
import i18n from 'i18next';
import { initLocale } from "./content";
import Tooltip from "@/content/Tooltip";
import { JSX } from "react";
import { createRoot, Root } from "react-dom/client";
import App from "@/content/App";

let root : Root;
let overlayElement: HTMLDivElement | null = null; // 오버레이 DIV
let infoElement: JSX.Element | null = null; // 툴팁 DIV ("Copied!" 메시지용)
let menuElement: HTMLDivElement | null = null; // 메뉴 DIV (선택창용)
let contentPort: chrome.runtime.Port | null = null; // 포트 연결 상태 관리;

export enum InspectionMode {
  TAG_EXTRACTION = 'TAG_EXTRACTION',
  TEXT_EXTRACTION = 'TEXT_EXTRACTION',
}
// -----------------------------------------------------------------------------
// 1. 유틸리티: CSS Selector 생성기 // TODO : Change to Library, remove child nth
// -----------------------------------------------------------------------------
const getUniqueSelector = (el: HTMLElement): string => {
  if (el.id) return '#' + el.id;

  let path = [];
  while (el.nodeType === Node.ELEMENT_NODE && el.tagName !== 'HTML') {
    let selector = el.nodeName.toLowerCase();
    if (el.className && typeof el.className === 'string') {
      // 클래스가 있으면 추가하되, 공백은 .으로 치환
      const classes = el.className.trim().split(/\s+/).join('.');
      if (classes) selector += '.' + classes;
    }

    // 형제 요소 중 몇 번째인지 확인 (nth-child) - 선택적 정밀도 향상
    let sibling = el;
    let nth = 1;
    while (sibling.previousElementSibling) {
      sibling = sibling.previousElementSibling as HTMLElement;
      if (sibling.nodeName.toLowerCase() === selector.split('.')[0]) nth++;
    }
    if (nth > 1) selector += `:nth-of-type(${nth})`;

    path.unshift(selector);
    el = el.parentNode as HTMLElement;
    if (!el || el.tagName === 'BODY') break;
  }
  return path.join(' > ');
};

// -----------------------------------------------------------------------------
// 2. UI 생성 로직 (Overlay, Tooltip, Menu)
// -----------------------------------------------------------------------------
function createUIComponents(inspectionMode: InspectionMode) {
  if (document.getElementById('extension-ui-container')) return;
  const container = document.createElement('div');
  container.id = 'extension-ui-container';
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  root = createRoot(container);
  document.body.appendChild(container);
  root.render(<App mode={inspectionMode}/>); // React 앱 렌더링
}

// 활성화 시 모드를 인자로 받을 수 있도록 변경 (default: TEXT)
export const activateInspectionMode = (mode: InspectionMode = InspectionMode.TEXT_EXTRACTION, port: chrome.runtime.Port) => {
  console.log(`Activate InspectionMode: ${mode}`);
  createUIComponents(mode); // UI 준비
  contentPort = port;
};

export const deactivateInspectionMode = () => {
  console.log('DeActivate InspectionMode');
  root.unmount();
  document.removeChild(document.getElementById('extension-ui-container')!);
  contentPort?.disconnect();
};
