import commonStyles from './ui/common.module.css';
import { EXTENSION_UI_ID } from './constants';

export const getCommonSelector = (el: HTMLElement, blacklist: string[] = []): string => {
  const path: string[] = [];
  let current: HTMLElement | null = el;

  // 2. 부모를 타고 올라가는 루프
  while (current && current.nodeType === Node.ELEMENT_NODE && current.tagName !== 'HTML') {
    const tagName = current.tagName.toLowerCase();

    let selector = tagName;

    // ---------------------------------------------------------
    // Class 처리
    // ---------------------------------------------------------
    if (current.className && typeof current.className === 'string') {
      const validClasses = current.className
        .trim()
        .split(/\s+/)
        .filter((cls) => cls && !blacklist.includes(cls)); // 블랙리스트 필터링

      if (validClasses.length > 0) {
        selector += `.${validClasses.join('.')}`;
      }
    }

    // ---------------------------------------------------------
    // Attribute 처리 (선택 사항)
    // ---------------------------------------------------------
    // data-* 속성이나 name 등 크롤링에 유용한 속성이 있다면 추가
    const usefulAttrs = ['name', 'data-type', 'role', 'aria-label'];
    Array.from(current.attributes).forEach((attr) => {
      if (usefulAttrs.includes(attr.name) || attr.name.startsWith('data-test')) {
        // 값에 공백이나 특수문자가 있을 수 있으므로 따옴표 처리
        selector += `[${attr.name}="${attr.value.replace(/"/g, '\\"')}"]`;
      }
    });

    path.unshift(selector);

    // 부모로 이동
    current = current.parentElement;

    // body를 만나면 종료 (너무 상위까지 가면 오히려 노이즈 발생)
    if (current && current.tagName === 'BODY') {
      path.unshift('body'); // 명시적으로 body 시작을 원하면 추가, 아니면 제거 가능
      break;
    }
  }
  // 부모 > 자식 관계 연결
  return path.join(' > ');
};

/**
 * 특정 Root 요소로부터 Target 요소까지의 CSS Selector를 생성합니다.
 * 예: .mean_list > li:nth-of-type(2) > .mean
 */
export function getRelativeSelector(target: HTMLElement, root: HTMLElement): string {
  const path: string[] = [];
  let current = target;

  // 1. Root에 도달하거나 DOM 끝에 닿을 때까지 반복
  while (current && current !== root) {
    let selector = current.tagName.toLowerCase();

    // A. ID가 있으면 게임 끝 (단, Root 내부 ID여야 의미 있음)
    if (current.id) {
      selector = `#${current.id}`;
      path.unshift(selector);
      break; // ID는 유일하므로 상위 경로 필요 없음 (선택사항: Root 범위 내라면 break)
    }

    // B. 클래스 처리 (유의미한 클래스만 추출)
    if (current.className && typeof current.className === 'string') {
      // 공백을 점(.)으로 치환하고, 쓸모없는 클래스(active, hover 등)는 필터링 가능
      const cleanClasses = current.className
        .trim()
        .split(/\s+/)
        .filter(c => !['highlight', 'on', 'active'].includes(c)) // 제외할 클래스
        .join('.');
      
      if (cleanClasses) {
        selector += `.${cleanClasses}`;
      }
    }

    // C. 형제 요소 중 나를 특정할 수 있는지 검사 (nth-of-type 필요성 체크)
    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children);
      
      // 나와 태그+클래스가 똑같은 형제가 몇 명인지 센다
      const sameTypeSiblings = siblings.filter(sib => 
        sib.tagName === current.tagName && 
        sib.className === current.className
      );

      // 쌍둥이가 있다면 순서(nth-of-type)를 붙여준다
      if (sameTypeSiblings.length > 1) {
        // 전체 형제 중 나의 인덱스 찾기 (nth-child)
        // 혹은 태그별 인덱스(nth-of-type)를 써도 됨. 여기선 nth-child 사용
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-child(${index})`;
      }
    }

    path.unshift(selector);
    current = current.parentElement as HTMLElement;
  }

  return path.join(' > ');
}




// 요소 유효성 검사
export const isValidElement = (element: HTMLElement) => {
  if (element.tagName === 'HTML' || element.tagName === 'BODY') return false;
  if (
    element.className.includes(commonStyles['extension-tooltip']) ||
    element.className.includes(commonStyles.highlight) ||
    element.className.includes(commonStyles.menu) ||
    element.className.includes(commonStyles.header) ||
    element.id === EXTENSION_UI_ID
  ) {
    return false;
  }
  return true;
};

export const tagToText = (tag: HTMLElement) => {
  return `<${tag.tagName.toLowerCase()}> ${(tag.textContent && tag.textContent.length > 15 ? tag.textContent?.trim().slice(0, 12) + '...' : tag.textContent) || ''}`;
};
export const checkUrlMatched = (urlPattern: string): boolean => {
  console.log(urlPattern);
  urlPattern = urlPattern || '*';
// use wildcard to match urlPattern
  const patternHost = urlPattern.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
  console.log(patternHost);
  const regexString =
  '^https?://(www\\.)?' + // 시작 부분에 선택적 https:// 또는 http:// 및 www.
  patternHost
  .split('*')
  .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .join('.*') +
  '($|/.*)'; // 끝 부분 또는 / 이하의 모든 문자열 허용
  console.log(regexString);

  const regex = new RegExp(regexString);
  console.log(regex, window.location.href);

  // 3. 현재 URL에 대해 정규식 테스트
  return regex.test(window.location.href);
};