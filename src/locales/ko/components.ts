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
  editorToolbar: {
    tooltipBold: '굵은 텍스트 (Ctrl+B)',
    tooltipItalic: '기울임 텍스트 (Ctrl+I)',
    tooltipUnderline: '밑줄 텍스트 (Ctrl+U)',
    tooltipSuper: '위 첨자 (Ctrl+=)',
    tooltipSub: '아래 첨자 (Ctrl+Shift+=)',
    tooltipColor: '텍스트 색상 (F7)',
    tooltipBgColor: '텍스트 강조 색상 (F8)',
    tooltipClean: '서식 제거 (Ctrl + R)',
    tooltipBullet: '글머리 기호 목록 (Ctrl + ,)',
    tooltipOrdered: '번호 매기기 목록 (Ctrl + .)',
    tooltipAlignment: '정렬',
    tooltipFile: '사진/오디오/비디오 첨부 (F3)',
    tooltipVoice: '음성 녹음 (F5)',
    tooltipFormula: '수식 (F6)',
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
  detectedDraft: {
    clickToEdit: '클릭하여 편집',
    clickToStopEditingAndRevert: '클릭하여 편집 중지 및 변경 사항 되돌리기',
    extractData: '데이터 추출',
  }
} satisfies typeof components;
