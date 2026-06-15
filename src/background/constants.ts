import { EMPTY_MODEL } from '@/types/app.types';
import { ScanRule } from '@/types/scanRule.types';

export const STORAGE_KEY = 'anki-note-wizard-global-var-store';
export const defaultScanRules: ScanRule[] = [
  {
    meta: {
      author: 'Admin',
      description: 'This is a sample scan rule. You can edit or delete it.',
      key: 'Sample ScanRule',
      version: '1.0.0',
    },
    scanRuleName: 'Sample ScanRule',
    modelId: EMPTY_MODEL.id,
    urlPatterns: ['*'],
    rootTagSelector: 'body',
    fields: {
      Front: [
        {
          content: 'div.front',
          selectorType: 'css',
          dataType: 'text',
        },
      ],
      Back: [
        {
          content: 'mean :',
          selectorType: 'literal',
          dataType: 'text',
        },
        {
          content: 'div.back',
          selectorType: 'css',
          dataType: 'text',
        },
      ],
    },
    tagIds: [],
  },
];
