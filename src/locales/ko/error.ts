import error from '../en/error';

export default {
  solutions: '해결책',
  codes: {
    '400': {
      code: '400',
      statusText: '잘못된 요청',
      description: '서버가 잘못된 구문으로 인해 요청을 이해할 수 없습니다.',
      solutions: ['요청을 확인하고 다시 시도하세요.'],
    },
    '401': {
      code: '401',
      statusText: '권한 없음',
      description: '인증이 필요하며 실패했거나 아직 제공되지 않았습니다.',
      solutions: ['유효한 인증 자격 증명을 제공하세요.'],
    },
    '402': {
      code: '402',
      statusText: '요청이 너무 많음',
      description: '사용자가 주어진 시간 내에 너무 많은 요청을 보냈습니다.',
      solutions: ['더 많은 요청을 보내기 전에 기다리세요.'],
    },
    '403': {
      code: '403',
      statusText: '금지됨',
      description: '클라이언트가 콘텐츠에 대한 액세스 권한이 없습니다.',
      solutions: ['권한을 확인하고 다시 시도하세요.'],
    },
    '404': {
      code: '404',
      statusText: '찾을 수 없음',
      description: '요청한 리소스를 찾을 수 없습니다.',
      solutions: ['URL을 확인하고 다시 시도하세요.'],
    },
    '408': {
      code: '408',
      statusText: '요청 시간 초과',
      description: '서버가 요청을 기다리는 동안 시간이 초과되었습니다.',
      solutions: ['나중에 다시 시도하세요.'],
    },
    '500': {
      code: '500',
      statusText: '내부 서버 오류',
      description: '서버가 처리할 수 없는 상황에 직면했습니다.',
      solutions: [
        '나중에 다시 시도하세요.',
        'Anki Note Wizard 또는 Chrome의 최신 버전으로 업데이트하세요.',
      ],
    },
    storageError: {
      code: 'storageError',
      statusText: '저장소 오류',
      description: '저장소에 액세스하는 동안 오류가 발생했습니다.',
      solutions: ['저장소 설정을 확인하고 다시 시도하세요.'],
    },
    unknownError: {
      code: 'unknownError',
      statusText: '알 수 없는 오류',
      description: '알 수 없는 오류가 발생했습니다.',
      solutions: [
        '다시 시도하세요.',
        'Anki Note Wizard 또는 Chrome의 최신 버전으로 업데이트하세요.',
      ],
    },
  },
  addNote: {
    modelNotFoundError: {
      code: 'modelNotFoundError',
      statusText: '모델을 찾을 수 없음',
      description: '노트에 지정된 모델이 Anki에 존재하지 않습니다.',
      solutions: ['노트에 올바른 모델을 선택하거나 생성하세요.'],
    },
    emptyModelError: {
      code: 'emptyModelError',
      statusText: '모델이 비어 있음',
      description: '노트를 추가하려면 모델이 필요합니다.',
      solutions: ['노트에 모델을 선택하거나 생성하세요.'],
    },
    emptyDeckError: {
      code: 'emptyDeckError',
      statusText: '덱이 비어 있음',
      description: '노트를 추가하려면 덱이 필요합니다.',
      solutions: ['노트에 덱을 선택하거나 생성하세요.'],
    },
    fieldModelMismatchError: {
      code: 'fieldModelMismatchError',
      statusText: '필드-모델 불일치',
      description: '노트의 필드가 모델과 일치하지 않습니다.',
      solutions: ['노트의 필드가 모델과 일치하는지 확인하세요.'],
    },
    duplicateNoteError: {
      code: 'duplicateNoteError',
      statusText: '중복된 노트',
      description: 'Anki에 이미 동일한 노트가 존재합니다.',
      solutions: ['노트 내용을 수정하여 중복을 피하세요.'],
    },
  },
  scanRule:{
    invallidScanRuleName: {
      code: 'invallidScanRuleName',
      statusText: '잘못된 스캔 규칙 이름',
      description: '스캔 규칙 이름이 유효하지 않습니다.',
      solutions: ['유효한 스캔 규칙 이름을 입력하세요.'],
    },
    duplicateScanRuleName: {
      code: 'duplicateScanRuleName',
      statusText: '중복된 스캔 규칙 이름',
      description: '동일한 이름의 스캔 규칙이 이미 존재합니다.',
      solutions: ['고유한 스캔 규칙 이름을 입력하세요.'],
    },
    invalidModel: {
      code: 'invalidModel',
      statusText: '잘못된 모델',
      description: '스캔 규칙에 지정된 모델이 유효하지 않습니다.',
      solutions: ['스캔 규칙에 유효한 모델을 선택하세요.'],
    },
    invalidRootTag: {
      code: 'invalidRootTag',
      statusText: '잘못된 루트 태그',
      description: '스캔 규칙에 지정된 루트 태그가 유효하지 않습니다.',
      solutions: ['스캔 규칙에 유효한 루트 태그를 입력하세요.'],
    }
  },
  detectPage: {
    selectDeckFirst: {
      code: 'selectDeckFirst',
      statusText: '먼저 덱을 선택하세요',
      description: '노트를 추가하기 전에 덱을 선택해야 합니다.',
      solutions: ['노트를 추가하기 전에 덱을 선택하세요.'],
    },
    addNoteFail: {
      code: 'addNoteFail',
      statusText: '노트 추가 실패',
      description: 'Anki에 노트를 추가하는 동안 오류가 발생했습니다.',
      solutions: ['다시 시도하세요.', 'Anki Note Wizard 또는 Chrome의 최신 버전으로 업데이트하세요.'],
    },
  }
} satisfies typeof error;
