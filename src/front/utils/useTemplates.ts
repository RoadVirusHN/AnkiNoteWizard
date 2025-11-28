import { create } from 'zustand';
import { persist } from 'zustand/middleware';

//TODO : change cards to key value pair
export interface Extracted{
  Front : Record<string, string>;
  Back : Record<string, string>;
};
export interface ExtractedMap{
  [idx: number]: Extracted[];
};
export enum TemplateFieldDataType {
  TEXT = 'text',
  AUDIO = 'audio',
  IMAGE = 'image',
}

export interface TemplateField {
  name: string;
  content: string;
  dataType: TemplateFieldDataType;
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
  deckName: string;
  modelName: string;
  fields: {
    Front: string;
    Back: string;
  };
  tags: string[];
  audio?: {
    url: string;
    filename: string;
    skipHash: string;
    fields: string | string[];
  };
}
export interface Template {
  meta: TemplateMeta;
  templateName: string;
  modelName: string;
  urlPatterns: string[];
  rootTag: string;
  Front: {
    html: string;
    fields: TemplateField[];
  };
  Back: {
    html: string;
    fields: TemplateField[];
  };
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
  addTemplate: (card: Template) => void;
  removeTemplate: (index: number) => void;
  modifyTemplate: (index: number, card: Template) => void;
  notes: { [idx: string]: Note };
  addNote: (idx: string, note: Note) => void;
  removeNote: (idx: string) => void;
  updateNote: (idx: string, updates: { [key: string]: unknown }) => void;
  setNotes: (newNotes: { [idx: string]: Note }) => void;
  tags: { [name: string]: { color: string } };
  addTag : (name: string, color: string) => void;
  removeTag : (name: string) => void;
  updateTag : (name: string, color: string) => void;
  extractedMaps: ExtractedMap;
  setExtractedMaps: (newMaps: ExtractedMap) => void;
}

const useTemplate = create<TemplateState>()(
  persist(
    (set) => ({
      templates: [],
      addTemplate: (template: Template) => {
        set((state) => ({ templates: [...state.templates, template] }));
      },
      removeTemplate: (index: number) => {
        set((state) => ({
          templates: state.templates.filter((_, i) => i !== index),
        }));
      },
      modifyTemplate: (index: number, template: Template) => {
        set((state) => ({
          templates: state.templates.map((c, i) => (i === index ? template : c)),
        }));
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
        setItem: async (name, value) => {
          await chrome.storage.local.set({ [name]: value }).then(()=>console.log("saved successfully")).catch(()=>console.log("saved error"));
          console.log("test,test,test");
          console.log({[name]: value});
        },
        removeItem: async (name) => await chrome.storage.local.remove(name),
      },
    }
  )
);

export default useTemplate;
