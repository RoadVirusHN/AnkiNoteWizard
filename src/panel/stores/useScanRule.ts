import { ErrorMessage } from '@/types/app.types';
import { Note, ScanRule as ScanRule } from '@/types/scanRule.types';
import i18next from 'i18next';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ScanRuleState {
  scanRules: ScanRule[];
  addScanRule: (scanRule: ScanRule) => ErrorMessage;
  removeScanRule: (name: string) => void;
  modifyScanRule: (name: string, scanRule: ScanRule) => ErrorMessage;
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

const isScanRuleVaild: (scanRule: ScanRule, curScanRules: ScanRule[]) => ErrorMessage = (
  scanRule: ScanRule,
  curScanRules: ScanRule[]
) => {
  const t = (key: string) => {
    // return i18next.t(key, '', { ns: 'error', keyPrefix: 'scanRule' });
    // @ts-expect-error i18next.t의 타입 정의가 keyPrefix를 지원하지 않아 발생하는 오류. 실제로는 keyPrefix 옵션이 적용되어 작동함.
    return i18next.t(`error:scanRule.${key}`) as string;
  };
  if (!scanRule.scanRuleName || scanRule.scanRuleName.trim() === '') {
    return {
      result: 'error',
      error: t('invallidScanRuleName.statusText'),
    };
  }
  if (curScanRules.filter((t) => t.scanRuleName === scanRule.scanRuleName).length > 0) {
    return {
      result: 'error',
      error: t('duplicateScanRuleName.statusText'),
    };
  }
  // if (!scanRule.meta.author || scanRule.meta.author.trim() === '') {
  //   return SCAN_RULE_CODE.INVALID_AUTHOR_NAME;
  // }
  if (!scanRule.modelId) {
    return {
      result: 'error',
      error: t('invalidModel.statusText'),
    };
  }
  if (!scanRule.rootTag || scanRule.rootTag.trim() === '') {
    return {
      result: 'error',
      error: t('invalidRootTag.statusText'),
    };
  }
  return {
    result: 'success',
    error: null,
  };
};

const useScanRule = create<ScanRuleState>()(
  persist(
    (set, get) => ({
      scanRules: [],
      addScanRule: (scanRule: ScanRule) => {
        const code = isScanRuleVaild(scanRule, get().scanRules);
        if (code.result === 'success')
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
        const res = isScanRuleVaild(scanRule, get().scanRules);
        if (res.result === 'error') {
          return res;
        }

        let founded = false;
        set((state) => ({
          scanRules: state.scanRules.map((c) => {
            founded = true;
            return c.scanRuleName === name ? scanRule : c;
          }),
        }));
        if (founded) {
          return {
            result: 'success',
            error: null,
          };
        } else {
          return {
            result: 'error',
            error: 'Scan rule not found',
          };
        }
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
