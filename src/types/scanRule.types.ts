//TODO : change cards to key value pair
export interface Extracted {
  [field: string]: { [item: string]: string };
}
export interface ExtractedMap {
  [idx: number]: Extracted[];
}
export enum TemplateItemDataType {
  TEXT = 'text',
  AUDIO = 'audio',
  IMAGE = 'image',
}

export interface TemplateItem {
  name: string;
  content: string;
  dataType: TemplateItemDataType;
  isOptional: boolean;
}

export interface TemplateMeta {
  key?: string;
  author?: string;
  description?: string;
  version?: string;
  url?: string;
}
export interface Note {
  templateName: string;
  deckName: string;
  modelName: string;
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
export interface Field {
  name: string;
  html: string;
  items: TemplateItem[];
  priority: number;
}
export interface Template {
  meta: TemplateMeta;
  templateName: string;
  model: Model;
  urlPatterns: string[];
  rootTag: string;
  fields: Field[];
  tags: string[];
  audio?: {
    url: string;
    filename: string;
    skipHash: string;
    fields: string[];
  };
}
export interface ModelField{
  name: string;
  html: string;
  style: string;
}
export interface Model {
  name: string;
  id: string;
  fields: Map<string, ModelField>;
  templates: {
    name: string;
    qfmt: string;
    afmt: string;
  }[];
}