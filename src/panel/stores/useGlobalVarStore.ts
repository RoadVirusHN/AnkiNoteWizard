import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Draft } from 'types/scanRule.types';
import { EMPTY_DECK, EMPTY_MODEL, EMPTY_SCANRULE, TAB, Tab } from '@/types/app.types';

interface GlobalVarState {
  currentUrl: string;
  currentTab: Tab;
  currentDeckId: string;
  isAddingCard: boolean;
  currentDetected: number;
  currentAddingDraft: Draft;
  isInspectionMode: boolean;
  setCurrentUrl: (url: string) => void;
  setCurrentTab: (tab: Tab) => void;
  setCurrentDeckId: (deckId: string) => void;
  setCurrentDetected: (cnt: number) => void;
  setCurrentAddingDraft: (note: Draft) => void;
  setIsAddingCard: (isAdding: boolean) => void;
  setIsInspectionMode: (isInspection: boolean) => void;
}

const useGlobalVarStore = create<GlobalVarState>()(
  persist(
    (set) => ({
      currentUrl: '/',
      currentTab: TAB.DETECT,
      currentDeckId: EMPTY_DECK.name,
      isAddingCard: false,
      currentDetected: 0,
      currentAddingDraft: {
        scanRuleId: EMPTY_SCANRULE.scanRuleName,
        deckId: EMPTY_DECK.name,
        modelId: EMPTY_MODEL.id,
        fields: [
          { key: 'Front', content: '' },
          { key: 'Back', content: '' },
        ],
        tagIds: [],
      },
      isInspectionMode: false,
      setCurrentUrl: (url: string) => {
        set({ currentUrl: url });
      },
      setCurrentTab: (tab: Tab) => {
        set({ currentTab: tab });
      },
      setCurrentDeckId: (deckId: string) => set({ currentDeckId: deckId }),
      setCurrentDetected: (cnt: number) => set({ currentDetected: cnt }),
      setCurrentAddingDraft: (draft: Draft) => set({ currentAddingDraft: draft }),
      setIsAddingCard: (isAdding: boolean) => set({ isAddingCard: isAdding }),
      setIsInspectionMode: (isInspection: boolean) => set({ isInspectionMode: isInspection }),
    }),
    {
      name: 'anki-note-wizard-global-var-store',
      storage: {
        getItem: async (name) => (await chrome.storage.local.get(name))[name],
        setItem: async (name, value) => await chrome.storage.local.set({ [name]: value }),
        removeItem: async (name) => await chrome.storage.local.remove(name),
      },
    }
  )
);

export default useGlobalVarStore;
