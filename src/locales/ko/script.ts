import script from '../en/script';
export default {
  noContentToExtract: '추출할 내용이 없습니다!',
  targetTagNotInTheRootTagWarning:
    '대상 태그가 루트 태그의 자손이 아닙니다. 이로 인해 예상치 못한 결과가 발생할 수 있습니다. 그래도 선택자 복사하시겠습니까?',
  extractedSelectors: '추출된 선택자',
  checkSelectorConfirmation: '선택자가 추출하려는 내용을 올바르게 선택하나요?',
  parentElement: '부모 요소',
  childrenElement: '자식 요소',
  noChildren: '자식 요소 없음'
} satisfies typeof script;
