import { TEMPLATE_CODE } from '@/types/app.types';
import { ExtractedMap, Model, Note, Template } from '@/types/scanRule.types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';


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
  models: {[modelName: string]: Model};
  addModel: (model: Model) => void;
  removeModel: (modelName: string) => void;
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
  if (!template.model) {
    return TEMPLATE_CODE.INVALID_MODEL;
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
      models: {},
      addModel: (model) => {
        set((state) => ({
          models: { ...state.models, [model.name]: model },
        }));
      },
      removeModel: (modelName) => {
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [modelName]: _deleted, ...rest } = state.models;
          return { models: rest };
        });
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
