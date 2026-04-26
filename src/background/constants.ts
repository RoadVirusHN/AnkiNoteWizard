import { Default_BASIC_MODEL } from '@/types/app.types';
import { ScanRule } from '@/types/scanRule.types';

export const STORAGE_KEY = 'anki-note-wizard-global-var-store';
export const defaultScanRules: ScanRule[] = [
  {
    meta: {},
    scanRuleName: 'Default ScanRule',
    modelId: Default_BASIC_MODEL.id,
    urlPatterns: ['*'],
    rootTag: 'body',
    fields:{
      Front: {
        selector: '',
        dataType: 'text',
      },
      Back: {
        selector: '',
        dataType: 'text',
      },
    },
    tags: [],
  },
];
