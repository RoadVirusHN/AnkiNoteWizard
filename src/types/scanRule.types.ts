//TODO : change cards to key value pair
export interface Extracted {
  [field: string]: { [item: string]: string };
}
export interface ExtractedMap {
  [idx: number]: Extracted[];
}

export const FIELD_DATA_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
} as const;

export type FieldDataType =
  (typeof FIELD_DATA_TYPES)[keyof typeof FIELD_DATA_TYPES];

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
    [fieldName: string]: string;
  };
  tags: string[];
  audio?: {
    url: string;
    filename: string;
    skipHash: string;
    fields: string | string[];
  };
}

export interface ScanRule {
  meta: ScanRuleMeta;
  scanRuleName: string;
  modelId: string;
  urlPatterns: string[];
  rootTag: string;
  tags: string[];
  fields: {
    [fieldName: string]: {
      selector: string;
      dataType: FieldDataType;
    };
  }
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