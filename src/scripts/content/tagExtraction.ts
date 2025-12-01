import { MessageType } from '../background/messages';

let overlayElement: HTMLDivElement | null = null; // 오버레이 DIV
let infoElement: HTMLDivElement | null = null; // 툴팁 DIV ("Copied!" 메시지용)
let menuElement: HTMLDivElement | null = null; // 메뉴 DIV (선택창용)

export enum InspectionMode {
  TAG_EXTRACTION = 'TAG_EXTRACTION',
  TEXT_EXTRACTION = 'TEXT_EXTRACTION',
}

let currentMode: InspectionMode = InspectionMode.TEXT_EXTRACTION; // 현재 모드 상태 관리

// -----------------------------------------------------------------------------
// 1. 유틸리티: CSS Selector 생성기
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
function createUIComponents() {
  // 2-1. 하이라이트 오버레이
  if (!overlayElement) {
    overlayElement = document.createElement('div');
    overlayElement.id = 'extension-overlay';
    Object.assign(overlayElement.style, {
      position: 'fixed',
      pointerEvents: 'none',
      zIndex: '999999',
      backgroundColor: 'rgba(173, 216, 230, 0.5)',
      border: '2px solid royalblue',
      boxSizing: 'border-box',
      display: 'none',
    });
    document.body.appendChild(overlayElement);
  }

  // 2-2. 알림 툴팁 (Copied 메시지)
  if (!infoElement) {
    infoElement = document.createElement('div');
    infoElement.id = 'extension-tooltip';
    Object.assign(infoElement.style, {
      position: 'fixed',
      zIndex: '1000000',
      padding: '5px 10px',
      backgroundColor: '#333',
      color: 'white',
      borderRadius: '4px',
      pointerEvents: 'none',
      display: 'none',
      fontSize: '12px',
      maxWidth: '300px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    });
    document.body.appendChild(infoElement);
  }

  // 2-3. 액션 메뉴 (텍스트/태그/자식 선택) - 클릭 상호작용 필요하므로 pointerEvents: auto
  if (!menuElement) {
    menuElement = document.createElement('div');
    menuElement.id = 'extension-menu';
    Object.assign(menuElement.style, {
      position: 'fixed',
      zIndex: '1000001',
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '6px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'none',
      flexDirection: 'column',
      minWidth: '200px',
      maxWidth: '300px',
      padding: '5px',
      fontFamily: 'sans-serif',
      fontSize: '13px',
      color: '#333',
    });
    document.body.appendChild(menuElement);

    // 메뉴 외부 클릭 시 닫기
    document.addEventListener('mousedown', (e) => {
      if (menuElement && menuElement.style.display !== 'none') {
        if (!menuElement.contains(e.target as Node)) {
          menuElement.style.display = 'none';
        }
      }
    });
  }
}

// -----------------------------------------------------------------------------
// 3. 메뉴 동작 로직
// -----------------------------------------------------------------------------

// 공통 버튼 스타일 생성
const createButtonStyle = (el: HTMLElement) => {
  Object.assign(el.style, {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    borderBottom: '1px solid #eee',
    fontSize: '13px',
  });
  el.onmouseover = () => {
    el.style.background = '#f0f0f0';
  };
  el.onmouseout = () => {
    el.style.background = 'transparent';
  };
};

// 메인 선택 메뉴 표시
const showActionMenu = (target: HTMLElement, x: number, y: number) => {
  if (!menuElement) return;

  // 위치 설정 (화면 밖으로 나가지 않게 조정 로직 추가 가능)
  menuElement.style.left = `${x}px`;
  menuElement.style.top = `${y}px`;
  menuElement.style.display = 'flex';
  menuElement.innerHTML = ''; // 초기화

  // 헤더 (현재 선택된 태그 정보)
  const header = document.createElement('div');
  header.textContent = `<${target.tagName.toLowerCase()}> Selected`;
  Object.assign(header.style, {
    padding: '8px 12px',
    fontWeight: 'bold',
    background: '#f8f9fa',
    borderBottom: '1px solid #ddd',
    borderRadius: '4px 4px 0 0',
    color: '#4a90e2',
  });
  menuElement.appendChild(header);

  // 1. 텍스트 추출 버튼
  const btnText = document.createElement('button');
  btnText.textContent = '📄 Extract Text';
  createButtonStyle(btnText);
  btnText.onclick = () => {
    const text = target.textContent?.trim() || '';
    copyToClipboard(text, x, y);
    menuElement!.style.display = 'none';
  };
  menuElement.appendChild(btnText);

  // 2. 태그 Selector 추출 버튼
  const btnSelector = document.createElement('button');
  btnSelector.textContent = '🎯 Extract Selector';
  createButtonStyle(btnSelector);
  btnSelector.onclick = () => {
    const selector = getUniqueSelector(target);
    copyToClipboard(selector, x, y);
    menuElement!.style.display = 'none';
  };
  menuElement.appendChild(btnSelector);

  // 3. 자식 요소 탐색 버튼
  if (target.children.length > 0) {
    const btnChildren = document.createElement('button');
    btnChildren.textContent = `📂 Select Children (${target.children.length})`;
    createButtonStyle(btnChildren);
    btnChildren.style.borderBottom = 'none'; // 마지막 요소
    btnChildren.onclick = (e) => {
      e.stopPropagation();
      showChildrenList(target, x, y);
    };
    menuElement.appendChild(btnChildren);
  }
};

// 자식 요소 리스트 표시 (서브 메뉴)
const showChildrenList = (parent: HTMLElement, x: number, y: number) => {
  if (!menuElement) return;

  menuElement.innerHTML = ''; // 초기화

  // 헤더 (뒤로가기 포함)
  const header = document.createElement('div');
  Object.assign(header.style, {
    padding: '8px 12px',
    fontWeight: 'bold',
    background: '#f8f9fa',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  });

  const backBtn = document.createElement('span');
  backBtn.textContent = '⬅';
  backBtn.style.cursor = 'pointer';
  backBtn.onclick = () => showActionMenu(parent, x, y);

  const title = document.createElement('span');
  title.textContent = 'Select Child';

  header.appendChild(backBtn);
  header.appendChild(title);
  menuElement.appendChild(header);

  // 리스트 컨테이너 (스크롤)
  const listContainer = document.createElement('div');
  Object.assign(listContainer.style, {
    maxHeight: '200px',
    overflowY: 'auto',
  });

  Array.from(parent.children).forEach((child) => {
    const childEl = child as HTMLElement;
    const item = document.createElement('button');
    // 태그명 + 간단한 내용 미리보기
    const preview = childEl.textContent?.substring(0, 15).trim() || '...';
    item.textContent = `<${childEl.tagName.toLowerCase()}> ${preview}`;
    createButtonStyle(item);

    item.onclick = (e) => {
      e.stopPropagation();
      // 재귀적 동작: 자식을 선택하면 해당 자식에 대해 다시 메인 메뉴를 띄움
      showActionMenu(childEl, x, y);
    };
    listContainer.appendChild(item);
  });

  menuElement.appendChild(listContainer);
};

// 클립보드 복사 및 툴팁 표시
const copyToClipboard = (text: string, x: number, y: number) => {
  if (!text) {
    alert('No content to extract!');
    return;
  }
  navigator.clipboard
    .writeText(text)
    .then(() => {
      showTooltip(text, x, y);
    })
    .catch((err) => console.error(err));
};

// 툴팁 표시 헬퍼
const showTooltip = (text: string, x: number, y: number) => {
  if (infoElement) {
    infoElement.textContent = `Copied: "${text.substring(0, 20)}${text.length > 20 ? '...' : ''}"`;
    infoElement.style.left = `${x + 15}px`;
    infoElement.style.top = `${y + 15}px`;
    infoElement.style.display = 'block';

    // Background Script로 메시지 전송 (기존 로직 유지)
    chrome.runtime.sendMessage({ type: MessageType.SEND_INSPECT_DATA, data: text });

    setTimeout(() => {
      if (infoElement) infoElement.style.display = 'none';
    }, 2000);
    deactivateInspectionMode(); // 작업 후 모드 비활성화
  }
};

// -----------------------------------------------------------------------------
// 4. 이벤트 핸들러
// -----------------------------------------------------------------------------

export const handleMouseOver = (event: MouseEvent) => {
  event.stopPropagation();
  const targetElement = event.target as HTMLElement;

  if (!isValidElement(targetElement)) return;

  // 메뉴가 떠있을 때는 오버레이 이동 잠시 멈춤 (선택 방해 방지)
  if (menuElement && menuElement.style.display !== 'none') return;

  const rect = targetElement.getBoundingClientRect();
  if (overlayElement) {
    overlayElement.style.top = `${rect.top}px`;
    overlayElement.style.left = `${rect.left}px`;
    overlayElement.style.width = `${rect.width}px`;
    overlayElement.style.height = `${rect.height}px`;
    overlayElement.style.display = 'block';
  }
};

export const handleMouseOut = () => {
  if (overlayElement) overlayElement.style.display = 'none';
};

export const handleMouseDown = (event: MouseEvent) => {
  // 메뉴 내부 클릭이면 무시 (이벤트 처리하도록 둠)
  if (menuElement && menuElement.contains(event.target as Node)) return;

  event.stopPropagation();
  event.preventDefault();

  const targetElement = event.target as HTMLElement;
  if (!isValidElement(targetElement)) return;

  // 분기 처리: 모드에 따라 동작 다름
  if (currentMode === InspectionMode.TAG_EXTRACTION) {
    // 태그 추출 모드 -> 메뉴 오픈
    showActionMenu(targetElement, event.clientX, event.clientY);
  } else {
    // 텍스트 추출 모드 (기존 동작)
    const textContent = targetElement.textContent?.trim() || '';
    if (textContent.length > 0) {
      copyToClipboard(textContent, event.clientX, event.clientY);
    }
  }

  // NOTE: 메뉴 선택을 위해 deactivateInspectionMode()를 즉시 호출하지 않음
  // 태그 모드일 때는 메뉴에서 작업을 마친 후 닫힘
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
export const activateInspectionMode = (mode: InspectionMode = InspectionMode.TEXT_EXTRACTION) => {
  console.log(`Activate InspectionMode: ${mode}`);
  currentMode = mode; // 모드 설정

  createUIComponents(); // UI 준비

  document.addEventListener('mouseover', handleMouseOver, true);
  document.addEventListener('mouseout', handleMouseOut, true);
  document.addEventListener('mousedown', handleMouseDown, true);
};

export const deactivateInspectionMode = () => {
  console.log('DeActivate InspectionMode');

  if (overlayElement) overlayElement.style.display = 'none';
  if (menuElement) menuElement.style.display = 'none'; // 메뉴도 숨김

  document.removeEventListener('mouseover', handleMouseOver, true);
  document.removeEventListener('mouseout', handleMouseOut, true);
  document.removeEventListener('mousedown', handleMouseDown, true);
};
