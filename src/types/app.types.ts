import i18next from 'i18next';
import { Deck, Model, ScanRule } from './scanRule.types';

export interface FetchAnkiRequestBody {
  action: string;
  params?: Record<string, unknown>;
}

// Enum changed into const + type for typescript performance optimization.
export const THEME_SETTING = {
  NONE: 'none',
  SYSTEM_DARK: 'system-dark',
  SYSTEM_LIGHT: 'system-light',
  LIGHT: 'light',
  DARK: 'dark',
} as const;
export type ThemeSetting = (typeof THEME_SETTING)[keyof typeof THEME_SETTING];

export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;
export type Theme = (typeof THEME)[keyof typeof THEME];

export const LOCALE = {
  EN: 'en',
  KO: 'ko',
} as const;
export type Locale = (typeof LOCALE)[keyof typeof LOCALE];

export const TAB = {
  DETECT: 'DETECT',
  ADD: 'ADD',
  HISTORY: 'HISTORY',
  SCAN_RULES: 'SCAN_RULES',
  CONFIG: 'CONFIG',
} as const;
export type Tab = (typeof TAB)[keyof typeof TAB];

export const TOOLTIP_DIRECTION = {
  TOP: 'top',
  BOTTOM: 'bottom',
  LEFT: 'left',
  RIGHT: 'right',
  UP_LEFT: 'up-left',
  UP_RIGHT: 'up-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_RIGHT: 'bottom-right',
} as const;
export type TooltipDirection = (typeof TOOLTIP_DIRECTION)[keyof typeof TOOLTIP_DIRECTION];

export const SCAN_RULE_CODE = {
  OK: 'ok',
  INVALID_SCAN_RULE_NAME: 'invalid_scanRule_name',
  DUPLICATE_SCAN_RULE_NAME: 'duplicate_scanRule_name',
  INVALID_AUTHOR_NAME: 'invalid_author_name',
  INVALID_MODEL: 'invalid_model',
  INVALID_ROOT_TAG: 'invalid_root_tag',
  NO_SUCH_SCAN_RULE: 'no_such_scanRule',
} as const;
export type SCAN_RULE_CODE = (typeof SCAN_RULE_CODE)[keyof typeof SCAN_RULE_CODE];

export const INSPECTION_MODE = {
  TAG_EXTRACTION: 'TAG_EXTRACTION',
  FIELD_EXTRACTION: 'FIELD_EXTRACTION',
  TEXT_EXTRACTION: 'TEXT_EXTRACTION',
} as const;

export type InspectionMode = (typeof INSPECTION_MODE)[keyof typeof INSPECTION_MODE];

export const EMPTY_MODEL = {
  name: i18next.t('common:no|word|Selected', { word: i18next.t('common:model') }),
  id: '',
  fields: ['Front', 'Back'],
} satisfies Model;

export const EMPTY_DECK = {
  name: ''
} satisfies Deck;
export const EMPTY_SCAN_RULE = {
  scanRuleName: '',
  meta: { author: '', description: '', version: '0.0.1' },
  modelId: EMPTY_MODEL.id,
  urlPattern: '*',
  rootTagSelector: 'div.word',
  fields: {
    Front: [
      {
        content: 'div.front',
        dataType: 'text',
        selectorType: 'css',
      },
    ],
    Back: [
      { content: 'mean :', dataType: 'text', selectorType: 'literal' },
      { content: 'div.back', dataType: 'text', selectorType: 'css' },
    ],
  },
  tagIds: [],
} satisfies ScanRule;
export const DEFAULT_DRAFT = {
  draftId: '',
  scanRuleId: EMPTY_SCAN_RULE.scanRuleName,
  deckId: EMPTY_DECK.name,
  modelId: EMPTY_MODEL.id,
  fields: [
    { key: 'Front', content: '' },
    { key: 'Back', content: '' },
  ],
  tagIds: [],
};
export type ErrorMessage = {
  result: 'error' | 'success';
  error: string | null;
};
