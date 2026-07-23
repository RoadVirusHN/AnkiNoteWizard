import common from '../en/common';

export default {
  model: '모델',
  scanRules: '스캔 규칙들',
  scanRule: '스캔 규칙',
  deck: '덱',
  tags: '태그',
  empty: '없음',
  newTag: '새 태그',
  ankiDisconnected: 'Anki 연결 끊김',
  checkAnkiConnection: 'Anki 연결 확인',  
  error: '오류',
  preview: '미리보기',
  save: '저장',
  ok: 'OK',
  cancel: '취소',
  text: '텍스트',
  selector: '선택자',
  draft: '초안',
  '|word|Modify': '{{word}} 수정',
  '|word|Copied': '{{word}} 복사',
  '|word|Selected': '{{word}} 선택됨',
  'extract|word|': '{{word}} 추출',
  'select|word|': '{{word}} 선택',
  'no|word|Selected': '{{word}} 선택되지 않음',
  delete: '삭제'
} satisfies typeof common;
