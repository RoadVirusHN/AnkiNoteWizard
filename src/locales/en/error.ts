export default {
  solutions: 'solutions',
  codes: {
    '400': {
      code: '400',
      statusText: 'Bad Request',
      description: 'The server could not understand the request due to invalid syntax.',
      solutions: ['Please check the request and try again.'],
    },
    '401': {
      code: '401',
      statusText: 'Unauthorized',
      description: 'Authentication is required and has failed or has not yet been provided.',
      solutions: ['Please provide valid authentication credentials.'],
    },
    '402': {
      code: '402',
      statusText: 'Too Many Requests',
      description: 'The user has sent too many requests in a given amount of time.',
      solutions: ['Please wait before sending more requests.'],
    },
    '403': {
      code: '403',
      statusText: 'Forbidden',
      description: 'The client does not have access rights to the content.',
      solutions: ['Please check your permissions and try again.'],
    },
    '404': {
      code: '404',
      statusText: 'Not Found',
      description: 'The requested resource could not be found.',
      solutions: ['Please check the URL and try again.'],
    },
    '408': {
      code: '408',
      statusText: 'Request Timeout',
      description: 'The server timed out waiting for the request.',
      solutions: ['Please try again later.'],
    },
    '500': {
      code: '500',
      statusText: 'Internal Server Error',
      description: "The server has encountered a situation it doesn't know how to handle.",
      solutions: [
        'Please try again later.',
        'Update to the latest version of Anki Card Wizard or Chrome.',
      ],
    },
    storageError: {
      code: 'storageError',
      statusText: 'Storage Error',
      description: 'An error occurred while accessing the storage.',
      solutions: ['Please check your storage settings and try again.'],
    },
    unknownError: {
      code: 'unknownError',
      statusText: 'Unknown Error',
      description: 'An unknown error has occurred.',
      solutions: [
        'Please try again.',
        'Update to the latest version of Anki Card Wizard or Chrome.',
      ],
    },
  },
  addNote: {
    modelNotFoundError: {
      code: 'modelNotFoundError',
      statusText: 'Model Not Found',
      description: 'The specified model could not be found.',
      solutions: ['Please select a valid model for the note.'],
    },
    emptyModelError: {
      code: 'emptyModelError',
      statusText: 'Empty Model',
      description: 'A model is required to add a note.',
      solutions: ['Please select or create a model for the note.'],
    },
    emptyDeckError: {
      code: 'emptyDeckError',
      statusText: 'Empty Deck',
      description: 'A deck is required to add a note.',
      solutions: ['Please select or create a deck for the note.'],
    },
    fieldModelMismatchError: {
      code: 'fieldModelMismatchError',
      statusText: 'Field-Model Mismatch',
      description: 'The fields provided do not match the model.',
      solutions: ['Please ensure the fields match the selected model.'],
    },
    duplicateNoteError: {
      code: 'duplicateNoteError',
      statusText: 'Duplicate Note',
      description: 'A note with the same content already exists.',
      solutions: ['Please modify the note content to make it unique.'],
    },
  },
  scanRule:{
    invallidScanRuleName: {
      code: 'invalidScanRuleName',
      statusText: 'Invalid Scan Rule Name',
      description: 'The scan rule name is invalid.',
      solutions: ['Please enter a valid scan rule name.'],
    },
    duplicateScanRuleName: {
      code: 'duplicateScanRuleName',
      statusText: 'Duplicate Scan Rule Name',
      description: 'A scan rule with the same name already exists.',
      solutions: ['Please enter a unique scan rule name.'],
    },
    invalidModel: {
      code: 'invalidModel',
      statusText: 'Invalid Model',
      description: 'The specified model is invalid.',
      solutions: ['Please select a valid model for the scan rule.'],
    },
    invalidRootTag: {
      code: 'invalidRootTag',
      statusText: 'Invalid Root Tag',
      description: 'The root tag is invalid.',
      solutions: ['Please enter a valid root tag.'],
    }
  },
  detectPage:{
    selectDeckFirst: {
      code: 'selectDeckFirst',
      statusText: 'Select Deck First',
      description: 'Please select a deck before adding notes.',
      solutions: ['Please select a deck from the dropdown menu.'],
    },
    addNoteFail: {
      code: 'addNoteFail',
      statusText: 'Add Note Failed',
      description: 'An error occurred while adding the note to Anki.',
      solutions: ['Please try again.', 'Check your Anki connection.'],
    },
  }
};
