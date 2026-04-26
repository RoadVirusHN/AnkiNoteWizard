import { SCAN_RULE_CODE as SCAN_RULE_CODE } from '@/types/app.types';
import { Note, ScanRule as ScanRule } from '@/types/scanRule.types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';


interface ScanRuleState {
  scanRules: ScanRule[];
  addScanRule: (scanRule: ScanRule) => SCAN_RULE_CODE;
  removeScanRule: (name: string) => void;
  modifyScanRule: (name: string, scanRule: ScanRule) => SCAN_RULE_CODE;
  notes: { [idx: string]: Note };
  addNote: (idx: string, note: Note) => void;
  removeNote: (idx: string) => void;
  updateNote: (idx: string, updates: { [key: string]: unknown }) => void;
  setNotes: (newNotes: { [idx: string]: Note }) => void;
  tags: { [name: string]: { color: string } };
  addTag: (name: string, color: string) => void;
  removeTag: (name: string) => void;
  updateTag: (name: string, color: string) => void;
}

const isScanRuleVaild = (scanRule: ScanRule, curScanRules: ScanRule[]): SCAN_RULE_CODE => {
  if (!scanRule.scanRuleName || scanRule.scanRuleName.trim() === '') {
    return SCAN_RULE_CODE.INVALID_SCAN_RULE_NAME;
  }
  if (curScanRules.filter((t) => t.scanRuleName === scanRule.scanRuleName).length > 0) {
    return SCAN_RULE_CODE.DUPLICATE_SCAN_RULE_NAME;
  }
  // if (!scanRule.meta.author || scanRule.meta.author.trim() === '') {
  //   return SCAN_RULE_CODE.INVALID_AUTHOR_NAME;
  // }
  if (!scanRule.modelId) {
    return SCAN_RULE_CODE.INVALID_MODEL;
  }
  if (!scanRule.rootTag || scanRule.rootTag.trim() === '') {
    return SCAN_RULE_CODE.INVALID_ROOT_TAG;
  }
  return SCAN_RULE_CODE.OK;
};

const useScanRule = create<ScanRuleState>()(
  persist(
    (set, get) => ({
      scanRules: [],
      addScanRule: (scanRule: ScanRule) => {
        const code = isScanRuleVaild(scanRule, get().scanRules);
        if (code === SCAN_RULE_CODE.OK)
          set((state) => ({ scanRules: [...state.scanRules, scanRule] }));
        return code;
      },
      removeScanRule: (name: string) => {
        set((state) => {
          const newNotes = {} as { [idx: string]: Note };
          Object.keys(state.notes).forEach((idx) => {
            const note = state.notes[idx];
            if (note.scanRuleName !== name) {
              newNotes[idx] = note;
            }
          });
          return {
            scanRules: state.scanRules.filter((info) => info.scanRuleName !== name),
            notes: newNotes,
          };
        });
      },
      modifyScanRule: (name: string, scanRule: ScanRule) => {
        const code = isScanRuleVaild(scanRule, get().scanRules);
        if (code === SCAN_RULE_CODE.DUPLICATE_SCAN_RULE_NAME) {
          set((state) => ({
            scanRules: state.scanRules.map((c) => (c.scanRuleName === name ? scanRule : c)),
          }));
          return SCAN_RULE_CODE.OK;
        } else if (code === SCAN_RULE_CODE.OK) return SCAN_RULE_CODE.NO_SUCH_SCAN_RULE;
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
    }),
    {
      name: 'anki-note-wizard-scan-rule-store',
      storage: {
        getItem: async (name) => (await chrome.storage.local.get(name))[name],
        setItem: async (name, value) => await chrome.storage.local.set({ [name]: value }),
        removeItem: async (name) => await chrome.storage.local.remove(name),
      },
    }
  )
);

export default useScanRule;
