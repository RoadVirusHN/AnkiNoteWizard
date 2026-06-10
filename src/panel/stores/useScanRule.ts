import { EMPTY_MODEL, ErrorMessage } from '@/types/app.types';
import { Draft, ScanRule as ScanRule, Tag } from '@/types/scanRule.types';
import i18next from 'i18next';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ScanRuleState {
  scanRules: {[scanRuleId:string]:ScanRule};
  addScanRule: (scanRule: ScanRule) => ErrorMessage;
  removeScanRule: (name: string) => void;
  modifyScanRule: (name: string, scanRule: ScanRule) => ErrorMessage;
  drafts: { [idx: string]: Draft };
  addDraft: (idx: string, note: Draft) => void;
  removeDraft: (idx: string) => void;
  updateDraft: (idx: string, updates: { [key: string]: unknown }) => void;
  setDrafts: (newDrafts: { [idx: string]: Draft }) => void;
  tags: { [name: string]: Tag };
  addTag: (name: string, color: string) => void;
  removeTag: (name: string) => void;
  updateTag: (name: string, color: string) => void;
}

const isScanRuleVaild: (scanRule: ScanRule, curScanRules: {[scanRuleName:string]:ScanRule}) => ErrorMessage = (
  scanRule: ScanRule,
  curScanRules: {[scanRuleName:string]:ScanRule}
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
  if (curScanRules.hasOwnProperty(scanRule.scanRuleName)) {
    return {
      result: 'error',
      error: t('duplicateScanRuleName.statusText'),
    };
  }
  // if (!scanRule.meta.author || scanRule.meta.author.trim() === '') {
  //   return SCAN_RULE_CODE.INVALID_AUTHOR_NAME;
  // }
  if (!scanRule.modelId || scanRule.modelId=== EMPTY_MODEL.id) {
    return {
      result: 'error',
      error: t('invalidModel.statusText'),
    };
  }
  if (!scanRule.rootTagSelector || scanRule.rootTagSelector.trim() === '') {
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
      scanRules: {},
      addScanRule: (scanRule: ScanRule) => {
        const code = isScanRuleVaild(scanRule, get().scanRules);
        if (code.result === 'success')
          set((state) => ({ scanRules: { ...state.scanRules, [scanRule.scanRuleName]: scanRule } }));
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
        const res = isScanRuleVaild(scanRule, get().scanRules);
        if (res.result === 'error') {
          return res;
        }

        if (get().scanRules.hasOwnProperty(scanRule.scanRuleName)) {
          set((state) => ({scanRules: { ...state.scanRules, [name]: scanRule }}));
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
