export default {
  solutions: 'solutions',
  codes: {
    '400': {
      statusText: 'Bad Request',
      description: 'The server could not understand the request due to invalid syntax.',
      solutions: ['Please check the request and try again.'],
    },
    '401': {
      statusText: 'Unauthorized',
      description: 'Authentication is required and has failed or has not yet been provided.',
      solutions: ['Please provide valid authentication credentials.'],
    },
    '402': {
      statusText: 'Too Many Requests',
      description: 'The user has sent too many requests in a given amount of time.',
      solutions: ['Please wait before sending more requests.'],
    },
    '403': {
      statusText: 'Forbidden',
      description: 'The client does not have access rights to the content.',
      solutions: ['Please check your permissions and try again.'],
    },
    '404': {
      statusText: 'Not Found',
      description: 'The requested resource could not be found.',
      solutions: ['Please check the URL and try again.'],
    },
    '408': {
      statusText: 'Request Timeout',
      description: 'The server timed out waiting for the request.',
      solutions: ['Please try again later.'],
    },
    '500': {
      statusText: 'Internal Server Error',
      description: "The server has encountered a situation it doesn't know how to handle.",
      solutions: [
        'Please try again later.',
        'Update to the latest version of Anki Card Wizard or Chrome.',
      ],
    },
    storageError: {
      statusText: 'Storage Error',
      description: 'An error occurred while accessing the storage.',
      solutions: ['Please check your storage settings and try again.'],
    },
    unknownError: {
      statusText: 'Unknown Error',
      description: 'An unknown error has occurred.',
      solutions: [
        'Please try again.',
        'Update to the latest version of Anki Card Wizard or Chrome.',
      ],
    },
  },
};
