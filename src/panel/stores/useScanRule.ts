import { EMPTY_MODEL, ErrorMessage } from '@/types/app.types';
import { Draft, ScanRule as ScanRule, Tag } from '@/types/scanRule.types';
import i18next from 'i18next';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ScanRuleState {
  scanRules: { [scanRuleId: string]: ScanRule };
  addScanRule: (scanRule: ScanRule) => ErrorMessage;
  removeScanRule: (name: string) => void;
  modifyScanRule: (name: string, scanRule: ScanRule) => ErrorMessage;
  drafts: { [idx: string]: Draft };
  getDrafts: () => Draft[];
  addDraft: (idx: string, note: Draft) => void;
  removeDraft: (idx: string) => void;
  updateDraft: (idx: string, updates: { [key: string]: unknown }) => void;
  setDrafts: (newDrafts: { [idx: string]: Draft }) => void;
  tags: { [name: string]: Tag };
  addTag: (name: string, color: string) => void;
  removeTag: (name: string) => void;
  updateTag: (name: string, color: string) => void;
}

const isScanRuleVaild: (
  targetScanRle: ScanRule,
  curScanRules: { [scanRuleName: string]: ScanRule },
  options?: { isModifying?: boolean }
) => ErrorMessage = (
  targetScanRule: ScanRule,
  curScanRules: { [scanRuleName: string]: ScanRule },
  options: { isModifying?: boolean } = {}
) => {
  if (!targetScanRule.scanRuleName || targetScanRule.scanRuleName.trim() === '') {
    return {
      result: 'error',
      error: i18next.t('error:scanRule.invallidScanRuleName.statusText'),
    };
  }
  if (!options.isModifying && curScanRules.hasOwnProperty(targetScanRule.scanRuleName)) {
    return {
      result: 'error',
      error: i18next.t('error:scanRule.duplicateScanRuleName.statusText'),
    };
  }
  // if (!scanRule.meta.author || scanRule.meta.author.trim() === '') {
  //   return SCAN_RULE_CODE.INVALID_AUTHOR_NAME;
  // }
  if (!targetScanRule.modelId || targetScanRule.modelId === EMPTY_MODEL.id) {
    return {
      result: 'error',
      error: i18next.t('error:scanRule.invalidModel.statusText'),
    };
  }
  if (!targetScanRule.rootTagSelector || targetScanRule.rootTagSelector.trim() === '') {
    return {
      result: 'error',
      error: i18next.t('error:scanRule.invalidRootTag.statusText'),
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
      scanRules: {},
      addScanRule: (scanRule: ScanRule) => {
        const code = isScanRuleVaild(scanRule, get().scanRules);
        if (code.result === 'success')
          set((state) => ({
            scanRules: { ...state.scanRules, [scanRule.scanRuleName]: scanRule },
          }));
        return code;
      },
      removeScanRule: (id: string) => {
        set((state) => {
          const newDrafts = {} as { [idx: string]: Draft };
          Object.keys(state.drafts).forEach((idx) => {
            const draft = state.drafts[idx];
            if (draft.scanRuleId !== id) {
              newDrafts[idx] = draft;
            }
          });
          const newScanRules = { ...state.scanRules };
          delete newScanRules[id];
          return {
            scanRules: newScanRules,
            drafts: newDrafts,
          };
        });
      },
      modifyScanRule: (name: string, scanRule: ScanRule) => {
        const res = isScanRuleVaild(scanRule, get().scanRules, { isModifying: true });
        if (res.result === 'error') {
          return res;
        }

        if (get().scanRules.hasOwnProperty(name)) {
          get().removeScanRule(name);
          get().addScanRule(scanRule);
          const drafts = get().drafts;
          Object.keys(drafts).forEach((draftKey) => {
            const draft = drafts[draftKey];
            if (draft.scanRuleId === name) {
              get().updateDraft(draftKey, { scanRuleId: scanRule.scanRuleName });
            }
          });
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
      drafts: {},
      getDrafts: () => Object.values(get().drafts),
      addDraft: (idx, note) => {
        set((state) => ({
          drafts: { ...state.drafts, [idx]: note },
        }));
      },
      removeDraft: (idx) => {
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [idx]: _deleted, ...rest } = state.drafts;
          return { drafts: rest };
        });
      },
      updateDraft: (idx, updates) => {
        set((state) => ({
          drafts: {
            ...state.drafts,
            [idx]: {
              ...state.drafts[idx],
              ...updates,
            },
          },
        }));
      },
      setDrafts: (newDrafts) => {
        set(() => ({
          drafts: newDrafts,
        }));
      },
      tags: {},
      addTag: (name, color) => {
        set((state) => ({
          tags: { ...state.tags, [name]: { name, color } },
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
            [name]: { name, color },
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
