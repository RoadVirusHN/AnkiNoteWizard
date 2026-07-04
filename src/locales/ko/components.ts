import components from '../en/components';

export default {
  tabs:{
    detect: '감지',
    add: '추가',
    scanRules: '스캔 규칙',
    config: '설정',
    connecting: '연결 중...',
    refresh: '재시도?',
    ankiDisconnected: 'Anki 연결 단절'
  },
  inspectionOverlay: {
    textModeTitle: '텍스트 추출 모드',
    hoverText: '텍스트 위에 마우스를 올리세요',
    clickToCopy: '클립보드에 복사하려면 클릭하세요.',
    pasteAnywhere: '원하는 곳에 텍스트를 붙여넣으세요!',
    tagModeTitle: '태그 검사 모드',
    hoverTag: '태그 위에 마우스를 올리세요',
    clickToOpenMenu: '메뉴를 열려면 클릭하세요',
    extractTextDescription: '"텍스트 추출" : 텍스트 내용을 복사합니다.',
    extractSelectorDescription: '"선택자 추출" : CSS 선택자를 복사합니다.',
    selectChildrenDescription: '"자식 선택" : 대상 자식 태그를 위한 새 메뉴를 엽니다.',
    exitInstruction: '모드를 종료하려면 여기를 클릭하세요.',
  },
  preview: {
    removedCodeWarning: '보안상의 이유로 일부 요소(스크립트, 태그)가 제거되었습니다.',
  },
  fieldInput: {
    fieldContentPlaceholder: '이 필드에 대한 내용을 입력하세요. 또한 미디어 파일(이미지, 오디오, 비디오)을 이 영역에 직접 붙여넣거나 드래그할 수도 있습니다.',
  },
  fieldScanInput: {
    containedTooManyEmptyWarn: '이 요소는 빈 문자가 많아 생성 결과가 다르게 보일 수 있습니다.'
  },
  fieldPropInput: {
    content: '내용',
    cssSelector: 'CSS 선택자',
    removeFieldProp: '이 필드 속성 삭제',
    addFieldProp: '새 필드 속성 추가',
    extractContent: '내용 추출',
    text: '텍스트',
    image: '이미지',
    audio: '소리',
    video: '영상',
    html: 'HTML',
    CSS: 'CSS',
    LITERAL: '문자열',
  },
} satisfies typeof components;
