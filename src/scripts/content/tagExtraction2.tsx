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

let currentMode: InspectionMode = InspectionMode.TEXT_EXTRACTION; // 현재 모드 상태 관리

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
// TODO : Make element IDs unique to avoid conflicts with other extensions
function createUIComponents() {

}

// -----------------------------------------------------------------------------
// 3. 메뉴 동작 로직
// -----------------------------------------------------------------------------

// 공통 버튼 스타일 생성
const createButtonStyle = (el: HTMLElement) => {

};

// 메인 선택 메뉴 표시
const showActionMenu = (target: HTMLElement, x: number, y: number) => {

};

// 자식 요소 리스트 표시 (서브 메뉴)
const showChildrenList = (parent: HTMLElement, x: number, y: number) => {

};

// 클립보드 복사 및 툴팁 표시
const copyToClipboard = (text: string, x: number, y: number) => {

  navigator.clipboard
    .writeText(text)
    .then(() => {
      contentPort?.postMessage({ type: MessageType.SEND_INSPECTION_DATA_FROM_CONTENT, data: text });
      showTooltip(text, x, y);
    })
    .catch((err) => console.error(err));
};

// 툴팁 표시 헬퍼
const showTooltip = (text: string, x: number, y: number) => {

};

// -----------------------------------------------------------------------------
// 4. 이벤트 핸들러
// -----------------------------------------------------------------------------

export const handleMouseOver = (event: MouseEvent) => {

};

export const handleMouseOut = () => {
};

export const handleClick = (event: MouseEvent) => {

};

// 요소 유효성 검사
const isValidElement = (element: HTMLElement) => {
  if (element.tagName === 'HTML' || element.tagName === 'BODY') return false;
  if (
    element.id === 'extension-overlay' ||
    element.id === 'extension-tooltip' ||
    element.id === 'extension-menu'
  )
    return false;
  return true;
};

// -----------------------------------------------------------------------------
// 5. 활성화/비활성화 (External Export)
// -----------------------------------------------------------------------------

// 활성화 시 모드를 인자로 받을 수 있도록 변경 (default: TEXT)
export const activateInspectionMode = (mode: InspectionMode = InspectionMode.TEXT_EXTRACTION, port: chrome.runtime.Port) => {
  console.log(`Activate InspectionMode: ${mode}`);
  currentMode = mode; // 모드 설정

  createUIComponents(); // UI 준비
  contentPort = port;
  document.addEventListener('mouseover', handleMouseOver, true);
  document.addEventListener('mouseout', handleMouseOut, true);
  document.addEventListener('click', handleClick, true);
  document.addEventListener('scroll', handleMouseOut, true);
};

export const deactivateInspectionMode = () => {
  console.log('DeActivate InspectionMode');

  if (overlayElement) overlayElement.style.display = 'none';
  if (menuElement) menuElement.style.display = 'none'; // 메뉴도 숨김

  contentPort?.disconnect();
  document.removeEventListener('mouseover', handleMouseOver, true);
  document.removeEventListener('mouseout', handleMouseOut, true);
  document.removeEventListener('click', handleClick, true);
  document.removeEventListener('scroll', handleMouseOut, true);
};
