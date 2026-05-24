import error from '../en/error';

export default {
  solutions: '해결책',
  codes: {
    '400': {
      statusText: '잘못된 요청',
      description: '서버가 잘못된 구문으로 인해 요청을 이해할 수 없습니다.',
      solutions: ['요청을 확인하고 다시 시도하세요.'],
    },
    '401': {
      statusText: '권한 없음',
      description: '인증이 필요하며 실패했거나 아직 제공되지 않았습니다.',
      solutions: ['유효한 인증 자격 증명을 제공하세요.'],
    },
    '402': {
      statusText: '요청이 너무 많음',
      description: '사용자가 주어진 시간 내에 너무 많은 요청을 보냈습니다.',
      solutions: ['더 많은 요청을 보내기 전에 기다리세요.'],
    },
    '403': {
      statusText: '금지됨',
      description: '클라이언트가 콘텐츠에 대한 액세스 권한이 없습니다.',
      solutions: ['권한을 확인하고 다시 시도하세요.'],
    },
    '404': {
      statusText: '찾을 수 없음',
      description: '요청한 리소스를 찾을 수 없습니다.',
      solutions: ['URL을 확인하고 다시 시도하세요.'],
    },
    '408': {
      statusText: '요청 시간 초과',
      description: '서버가 요청을 기다리는 동안 시간이 초과되었습니다.',
      solutions: ['나중에 다시 시도하세요.'],
    },
    '500': {
      statusText: '내부 서버 오류',
      description: '서버가 처리할 수 없는 상황에 직면했습니다.',
      solutions: [
        '나중에 다시 시도하세요.',
        'Anki Note Wizard 또는 Chrome의 최신 버전으로 업데이트하세요.',
      ],
    },
    storageError: {
      statusText: '저장소 오류',
      description: '저장소에 액세스하는 동안 오류가 발생했습니다.',
      solutions: ['저장소 설정을 확인하고 다시 시도하세요.'],
    },
    unknownError: {
      statusText: '알 수 없는 오류',
      description: '알 수 없는 오류가 발생했습니다.',
      solutions: [
        '다시 시도하세요.',
        'Anki Note Wizard 또는 Chrome의 최신 버전으로 업데이트하세요.',
      ],
    },
  },
} satisfies typeof error;
