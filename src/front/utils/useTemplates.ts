import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  modelName: string;
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
interface TemplateState {
  templates: Template[];
  addTemplate: (card: Template) => TEMPLATE_CODE;
  removeTemplate: (name: string) => void;
  modifyTemplate: (name: string, card: Template) => TEMPLATE_CODE;
  notes: { [idx: string]: Note };
  addNote: (idx: string, note: Note) => void;
  removeNote: (idx: string) => void;
  updateNote: (idx: string, updates: { [key: string]: unknown }) => void;
  setNotes: (newNotes: { [idx: string]: Note }) => void;
  tags: { [name: string]: { color: string } };
  addTag: (name: string, color: string) => void;
  removeTag: (name: string) => void;
  updateTag: (name: string, color: string) => void;
  extractedMaps: ExtractedMap;
  setExtractedMaps: (newMaps: ExtractedMap) => void;
}

export enum TEMPLATE_CODE {
  OK = 'OK',
  INVALID_TEMPLATE_NAME = 'INVALID_TEMPLATE_NAME',
  DUPLICATE_TEMPLATE_NAME = 'DUPLICATE_TEMPLATE_NAME',
  INVALID_AUTHOR_NAME = 'INVALID_AUTHOR_NAME',
  INVALID_MODEL_NAME = 'INVALID_MODEL_NAME',
  INVALID_ROOT_TAG = 'INVALID_ROOT_TAG',
  NO_SUCH_TEMPLATE = 'NO_SUCH_TEMPLATE',
}

const isTemplateValid = (template: Template, curTemplates: Template[]): TEMPLATE_CODE => {
  if (!template.templateName || template.templateName.trim() === '') {
    return TEMPLATE_CODE.INVALID_TEMPLATE_NAME;
  }
  if (curTemplates.filter((t) => t.templateName === template.templateName).length > 0) {
    return TEMPLATE_CODE.DUPLICATE_TEMPLATE_NAME;
  }
  // if (!template.meta.author || template.meta.author.trim() === '') {
  //   return TEMPLATE_CODE.INVALID_AUTHOR_NAME;
  // }
  if (!template.modelName || template.modelName.trim() === '') {
    return TEMPLATE_CODE.INVALID_MODEL_NAME;
  }
  if (!template.rootTag || template.rootTag.trim() === '') {
    return TEMPLATE_CODE.INVALID_ROOT_TAG;
  }
  return TEMPLATE_CODE.OK;
};

const useTemplate = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: [],
      addTemplate: (template: Template) => {
        const code = isTemplateValid(template, get().templates);
        if (code === TEMPLATE_CODE.OK)
          set((state) => ({ templates: [...state.templates, template] }));
        return code;
      },
      removeTemplate: (name: string) => {
        set((state) => {
          const newNotes = {} as { [idx: string]: Note };
          Object.keys(state.notes).forEach((idx) => {
            const note = state.notes[idx];
            if (note.templateName !== name) {
              newNotes[idx] = note;
            }
          });
          return {
            templates: state.templates.filter((info) => info.templateName !== name),
            notes: newNotes,
          };
        });
      },
      modifyTemplate: (name: string, template: Template) => {
        const code = isTemplateValid(template, get().templates);
        if (code === TEMPLATE_CODE.DUPLICATE_TEMPLATE_NAME) {
          set((state) => ({
            templates: state.templates.map((c) => (c.templateName === name ? template : c)),
          }));
          return TEMPLATE_CODE.OK;
        } else if (code === TEMPLATE_CODE.OK) return TEMPLATE_CODE.NO_SUCH_TEMPLATE;
        return code;
      },
      notes: {},
      addNote: (idx, note) => {
        set((state) => ({
          notes: { ...state.notes, [idx]: note },
        }));
      },
      removeNote: (idx) => {
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [idx]: _deleted, ...rest } = state.notes;
          return { notes: rest };
        });
      },
      updateNote: (idx, updates) => {
        set((state) => ({
          notes: {
            ...state.notes,
            [idx]: {
              ...state.notes[idx],
              ...updates,
            },
          },
        }));
      },
      setNotes: (newNotes) => {
        set(() => ({
          notes: newNotes,
        }));
      },
      tags: {},
      addTag: (name, color) => {
        set((state) => ({
          tags: { ...state.tags, [name]: { color } },
        }));
      },
      removeTag: (name) => {
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [name]: _deleted, ...rest } = state.tags;
          return { tags: rest };
        });
      },
      updateTag: (name, color) => {
        set((state) => ({
          tags: {
            ...state.tags,
            [name]: { color },
          },
        }));
      },
      extractedMaps: {},
      setExtractedMaps: (newMaps) => {
        set(() => ({
          extractedMaps: newMaps,
        }));
      },
    }),
    {
      name: 'anki-card-wizard-template-store',
      storage: {
        getItem: async (name) => (await chrome.storage.local.get(name))[name],
        setItem: async (name, value) => await chrome.storage.local.set({ [name]: value }),
        removeItem: async (name) => await chrome.storage.local.remove(name),
      },
    }
  )
);

export default useTemplate;
