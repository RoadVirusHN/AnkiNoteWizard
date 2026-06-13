export interface ExtractedInfos {
  [scanRuleIdx: number]: ExtractedFields[];
}

export interface ExtractedFields {
  [fieldName: string]: string;
}

export const FIELD_DATA_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
  HTML: 'html',
} as const;

export type FieldDataType = (typeof FIELD_DATA_TYPES)[keyof typeof FIELD_DATA_TYPES];

export type FieldData = {
  key: string;
  content: string;
}
export interface ScanRuleMeta {
  key?: string;
  author?: string;
  description?: string;
  version?: string;
  url?: string;
}
// TODO : scanrule, deck, model to be identified by id instead of name to avoid confusion when there are multiple scanrules, decks or models with the same name. This requires some changes in the backend as well.
export interface Draft {
  draftId: string;
  scanRuleId: string;
  deckId: string;
  modelId: string;
  fields: FieldData[];
  tagIds: string[];
  audio?: {
    url: string;
    filename: string;
    skipHash: string;
    fields: string | string[];
  };
}

export const SELECTOR_TYPES = {
  CSS: 'css',
  // XPATH: 'xpath',
  // javascript selector can be added in the future if needed
} as const;

export type SelectorType = (typeof SELECTOR_TYPES)[keyof typeof SELECTOR_TYPES];
export interface FieldProperties {
  selector: string;
  selectorType?: SelectorType;
  dataType: FieldDataType;
}

// TODO : scanrule, model to be identified by id instead of name to avoid confusion when there are multiple scanrules, decks or models with the same name. This requires some changes in the backend as well.
// TODO : 사용자 Anki 와의 불일치하는 deck, model 등의 문제 해결
export interface ScanRule {
  meta: ScanRuleMeta;
  scanRuleName: string;
  modelId: string;
  urlPatterns: string[];
  rootTagSelector: string;
  tagIds: string[];
  fields: {
    [fieldName: string]: FieldProperties;
  };
  audio?: {
    url: string;
    filename: string;
    skipHash: string;
    fields: string[];
  };
}
export interface Model {
  name: string;
  id: string;
  fields: string[];
  style?: string;
}

export interface Deck {
  name: string;
}

export interface Tag {
  name: string;
  color: string;
}

