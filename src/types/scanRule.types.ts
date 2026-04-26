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
} as const;

export type FieldDataType = (typeof FIELD_DATA_TYPES)[keyof typeof FIELD_DATA_TYPES];

export interface ScanRuleMeta {
  key?: string;
  author?: string;
  description?: string;
  version?: string;
  url?: string;
}
export interface Note {
  scanRuleName: string;
  deckName: string;
  modelId: string;
  fields: {
    [fieldName: string]: FieldContent;
  };
  tags: string[];
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
export interface FieldContent {
  value: string;
  dataType: FieldDataType;
}

export interface ScanRule {
  meta: ScanRuleMeta;
  scanRuleName: string;
  modelId: string;
  urlPatterns: string[];
  rootTag: string;
  tags: string[];
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
