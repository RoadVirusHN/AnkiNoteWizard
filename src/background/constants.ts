import { Default_BASIC_MODEL } from '@/types/app.types';
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
    modelId: Default_BASIC_MODEL.id,
    modelName: Default_BASIC_MODEL.name,
    urlPatterns: ['*'],
    rootTag: 'body',
    fields: {
      Front: {
        selector: '',
        dataType: 'text',
      },
      Back: {
        selector: '',
        dataType: 'text',
      },
    },
    tags: ["sample", "tutorial"],
  },
];
