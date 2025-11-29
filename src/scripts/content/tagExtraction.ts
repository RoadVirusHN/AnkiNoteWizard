let overlayElement : HTMLDivElement | null; // 오버레이 DIV를 저장할 변수


// 1. 오버레이 DIV 생성 및 문서에 추가
function createOverlay() {
  if (!overlayElement) {
    overlayElement = document.createElement('div');
    overlayElement.classList.add('extension-overlay-highlight');
    overlayElement.style.backgroundColor='black';
    overlayElement.style.zIndex='9999999999999999';
    overlayElement.style.position='fixed';
    overlayElement.style.pointerEvents='none';
    document.body.appendChild(overlayElement);
  }
}

// 2. 마우스 오버 이벤트 핸들러
export const handleMouseOver = (event: MouseEvent) => {
  // 이벤트 버블링 방지 (불필요한 오버레이 위치 변경 방지)
  event.stopPropagation();

  const targetElement = event.target as HTMLElement;

  // 특정 요소(예: HTML, BODY)는 제외
  if (targetElement.tagName === 'HTML' || targetElement.tagName === 'BODY') {
    return;
  }

  // 3. getBoundingClientRect()를 사용하여 요소의 위치와 크기 정보 가져오기
  const rect = targetElement.getBoundingClientRect();

  // 4. 오버레이 DIV의 스타일(위치 및 크기) 설정
  //    position: fixed 이므로 뷰포트 기준 좌표인 top, left, width, height 사용
  if (overlayElement) {
    overlayElement.style.top = `${rect.top}px`;
    overlayElement.style.left = `${rect.left}px`;
    overlayElement.style.width = `${rect.width}px`;
    overlayElement.style.height = `${rect.height}px`;
    overlayElement.style.display = 'block'; // 보이도록 설정
  }
  console.log(targetElement.tagName);
  console.log(targetElement.textContent);
  console.log(targetElement.childNodes);
}

// 5. 마우스 아웃 이벤트 핸들러 (선택사항: 특정 시점에 오버레이 숨기기)
export const handleMouseOut = () => {
  // 필요하다면 마우스가 벗어날 때 오버레이를 숨길 수 있습니다.
  if (overlayElement) overlayElement.style.display = 'none';
}


// 확장 기능 활성화 시 호출
export const activateInspectionMode = () => {
    console.log("Activate InsepctionMode");
  createOverlay();
  // 문서 전체에 mouseover 이벤트를 리스닝합니다.
  document.addEventListener('mouseover', handleMouseOver, true); // 캡처링 단계에서 이벤트 감지
  document.addEventListener('mouseout', handleMouseOut, true);
  //document.addEventListener('mousedown', handleMouseDown, true);
}

// 확장 기능 비활성화 시 호출
export const deactivateInspectionMode = () => {
    console.log("DeActivate InsepctionMode");
  if (overlayElement) {
    document.body.removeChild(overlayElement);
    overlayElement = null;
  }
  document.removeEventListener('mouseover', handleMouseOver, true);
  // document.removeEventListener('mouseout', handleMouseOut, true);
}
