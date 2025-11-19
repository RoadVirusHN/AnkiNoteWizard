import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export enum TemplateFieldDataType {
  TEXT = 'text',
  AUDIO = 'audio',
  IMAGE = 'image',
}

export interface TemplateField {
  name: string;
  content: string;
  dataType: TemplateFieldDataType;
}

export interface TemplateMeta {
  key?: string;
  author?: string;
  description?: string;
  version?: string;
  url?: string;
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
    }),
    {
      name: 'anki-card-wizard-global-var-store',
      storage: {
        getItem: async (name) => (await chrome.storage.local.get(name))[name],
        setItem: async (name, value) => await chrome.storage.local.set({ [name]: value }),
        removeItem: async (name) => await chrome.storage.local.remove(name),
      },
    }
  )
);

export default useTemplate;
