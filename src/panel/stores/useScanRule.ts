import { EMPTY_MODEL, ErrorMessage } from '@/types/app.types';
import { Draft, ScanRule as ScanRule, Tag } from '@/types/scanRule.types';
import i18next from 'i18next';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// TODO: Make hooks for only exposing getter and setter functions
interface ScanRuleState {
  _scanRules: {[scanRuleId:string]:ScanRule};
  getScanRules: () => ScanRule[];
  getScanRule: (scanRuleId:string)=>ScanRule | null;
  addScanRule: (scanRule: ScanRule) => ErrorMessage;
  removeScanRule: (name: string) => void;
  modifyScanRule: (name: string, scanRule: ScanRule) => ErrorMessage;
  _drafts: { [idx: string]: Draft };
  getDrafts: () => Draft[];
  getDraft: (idx: string) => Draft | null;
  addDraft: (idx: string, note: Draft) => void;
  removeDraft: (idx: string) => void;
  updateDraft: (idx: string, updates: { [key: string]: unknown }) => void;
  setDrafts: (newDrafts: { [idx: string]: Draft }) => void;
  _tags: { [name: string]: Tag };
  getTag: (name: string) => Tag | null;
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
      _scanRules: {},
      getScanRules: () => Object.values(get()._scanRules),
      getScanRule: (id: string) => {
        const scanRule = get()._scanRules[id];
        return scanRule ? scanRule : null;
      },
      addScanRule: (scanRule: ScanRule) => {
        const code = isScanRuleVaild(scanRule, get()._scanRules);
        if (code.result === 'success')
          set((state) => ({ _scanRules: { ...state._scanRules, [scanRule.scanRuleName]: scanRule } }));
        return code;
      },
      removeScanRule: (id: string) => {
        set((state) => {
          const newDrafts = {} as { [idx: string]: Draft };
          Object.keys(state._drafts).forEach((idx) => {
            const draft = state._drafts[idx];
            if (draft.scanRuleId !== id) {
              newDrafts[idx] = draft;
            }
          });
          const newScanRules = { ...state._scanRules };
          delete newScanRules[id];
          return {
            _scanRules: newScanRules,
            _drafts: newDrafts,
          };
        });
      },
      modifyScanRule: (name: string, scanRule: ScanRule) => {
        const res = isScanRuleVaild(scanRule, get()._scanRules);
        if (res.result === 'error') {
          return res;
        }

        if (get()._scanRules.hasOwnProperty(scanRule.scanRuleName)) {
          set((state) => ({_scanRules: { ...state._scanRules, [name]: scanRule }}));
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
      _drafts: {},
      getDrafts: () => Object.values(get()._drafts),
      getDraft: (idx) => {
        const draft = get()._drafts[idx];
        return draft ? draft : null;
      },
      addDraft: (idx, note) => {
        set((state) => ({
          _drafts: { ...state._drafts, [idx]: note },
        }));
      },
      removeDraft: (idx) => {
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [idx]: _deleted, ...rest } = state._drafts;
          return { _drafts: rest };
        });
      },
      updateDraft: (idx, updates) => {
        set((state) => ({
          _drafts: {
            ...state._drafts,
            [idx]: {
              ...state._drafts[idx],
              ...updates,
            },
          },
        }));
      },
      setDrafts: (newDrafts) => {
        set(() => ({
          _drafts: newDrafts,
        }));
      },
      _tags: {},
      getTag: (name) => {
        const tag = get()._tags[name];
        return tag ? tag : null;
      },
      addTag: (name, color) => {
        set((state) => ({
          _tags: { ...state._tags, [name]: { name, color } },
        }));
      },
      removeTag: (name) => {
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [name]: _deleted, ...rest } = state._tags;
          return { _tags: rest };
        });
      },
      updateTag: (name, color) => {
        set((state) => ({
          _tags: {
            ...state._tags,
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
