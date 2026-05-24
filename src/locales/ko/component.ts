import component from '../en/component';

export default {
  modelInput: {
    ankiConnectionError: 'Anki 연결 오류',
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
} satisfies typeof component;
