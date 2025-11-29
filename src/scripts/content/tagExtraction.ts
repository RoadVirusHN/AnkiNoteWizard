let overlayElement : HTMLDivElement | null; // 오버레이 DIV를 저장할 변수
let infoElement : HTMLDivElement | null;

// 1. 오버레이 DIV 생성 및 문서에 추가
function createOverlay() {
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
        display: 'none'
    });
    document.body.appendChild(overlayElement);
  }else {
    overlayElement = document.getElementById('extension-overlay') as HTMLDivElement;
  }
    if (!document.getElementById('extension-tooltip')) {
        infoElement = document.createElement('div');
        infoElement.id = 'extension-tooltip';
        Object.assign(infoElement.style, {
            position: 'fixed',
            zIndex: '1000000',
            padding: '5px 10px',
            backgroundColor: '#333',
            color: 'white',
            borderRadius: '4px',
            pointerEvents: 'none', // 툴팁도 이벤트 무시
            display: 'none',
            maxWidth: '300px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        });
        document.body.appendChild(infoElement);
    } else {
        infoElement = document.getElementById('extension-tooltip') as HTMLDivElement;
    }
}

// 2. 마우스 오버 이벤트 핸들러
export const handleMouseOver = (event: MouseEvent) => {
  // 이벤트 버블링 방지 (불필요한 오버레이 위치 변경 방지)
  event.stopPropagation();

  const targetElement = event.target as HTMLElement;

  // 유효성 검사
  if (!isValidElement(targetElement)) {
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
  if (infoElement && infoElement.style.display !== 'none') {
      // 커서 위치 + 약간의 오프셋
      infoElement.style.left = `${event.clientX + 15}px`;
      infoElement.style.top = `${event.clientY + 15}px`;
  }

}

// 5. 마우스 아웃 이벤트 핸들러 (선택사항: 특정 시점에 오버레이 숨기기)
export const handleMouseOut = () => {
  // 필요하다면 마우스가 벗어날 때 오버레이를 숨길 수 있습니다.
  if (overlayElement) overlayElement.style.display = 'none';
}

// 툴팁 표시 함수
const showTooltip = (text: string, x:number, y:number) => {
    if (infoElement) {
        infoElement.textContent = `Copied: "${text}"`;
        infoElement.style.left = `${x + 15}px`;
        infoElement.style.top = `${y + 15}px`;
        infoElement.style.display = 'block';

        // 2초 후에 툴팁 숨기기
        setTimeout(() => {
          if (infoElement!=null) infoElement.style.display = 'none';
        }, 2000);
    }
}

export const handleMouseDown= (event: MouseEvent) =>{
    event.stopPropagation();
    event.preventDefault();

    const targetElement = event.target as HTMLElement;

    // 1. 유효성 검사
    if (isValidElement(targetElement)) {
        const textContent = targetElement.textContent.trim();

        if (textContent.length > 0) {
            // 2. 클립보드에 복사
            navigator.clipboard.writeText(textContent).then(() => {
                console.log('텍스트가 클립보드에 복사되었습니다:', textContent);

                // 3. 커서 위치에 툴팁 표시
                showTooltip(textContent, event.clientX, event.clientY);

            }).catch(err => {
                console.error('클립보드 복사 실패:', err);
            });
        }
    }

    // 4. 검사 모드 비활성화 (클릭 후 종료)
    deactivateInspectionMode();
}


// 요소 유효성 검사 함수
const isValidElement = (element: HTMLElement) => {
    // HTML, BODY 태그 제외
    if (element.tagName === 'HTML' || element.tagName === 'BODY') {
        return false;
    }
    // 확장 프로그램 내부에서 생성된 요소 제외 (ID로 구분)
    if (element.id === 'extension-overlay' || element.id === 'extension-tooltip') {
        return false;
    }
    // 추가적인 사용자 정의 예외 처리 가능
    return true;
}

// 확장 기능 활성화 시 호출
export const activateInspectionMode = () => {
  console.log("Activate InsepctionMode");
  createOverlay();
  // 문서 전체에 mouseover 이벤트를 리스닝합니다.
  document.addEventListener('mouseover', handleMouseOver, true); // 캡처링 단계에서 이벤트 감지
  document.addEventListener('mouseout', handleMouseOut, true);
  document.addEventListener('mousedown', handleMouseDown, true);
}

// 확장 기능 비활성화 시 호출
export const deactivateInspectionMode = () => {
  console.log("DeActivate InsepctionMode");

  if (overlayElement) {
      overlayElement.style.display = 'none';
  }
  document.removeEventListener('mouseover', handleMouseOver, true);
  document.removeEventListener('mouseout', handleMouseOut, true);
  document.addEventListener('mousedown',handleMouseDown, true);
}
