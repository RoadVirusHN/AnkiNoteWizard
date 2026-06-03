import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Note } from 'types/scanRule.types';
import { Default_BASIC_MODEL, TAB, Tab } from '@/types/app.types';

interface GlobalVarState {
  currentUrl: string;
  currentTab: Tab;
  currentDeck: string;
  isAddingCard: boolean;
  currentDetected: number;
  currentAddingNote: Note;
  isInspectionMode: boolean;
  setCurrentUrl: (url: string) => void;
  setCurrentTab: (tab: Tab) => void;
  setCurrentDeck: (deck: string) => void;
  setCurrentDetected: (cnt: number) => void;
  setCurrentAddingNote: (note: Note) => void;
  setIsAddingCard: (isAdding: boolean) => void;
  setIsInspectionMode: (isInspection: boolean) => void;
}

const useGlobalVarStore = create<GlobalVarState>()(
  persist(
    (set) => ({
      currentUrl: '/',
      currentTab: TAB.DETECT,
      currentDeck: '',
      isAddingCard: false,
      currentDetected: 0,
      currentAddingNote: {
        scanRuleName: '',
        deckName: '',
        modelId: Default_BASIC_MODEL.id,
        fields: [
          { key: 'Front', content: '' },
          { key: 'Back', content: '' },
        ],
        tags: [],
      },
      isInspectionMode: false,
      setCurrentUrl: (url: string) => {
        set({ currentUrl: url });
      },
      setCurrentTab: (tab: Tab) => {
        set({ currentTab: tab });
      },
      setCurrentDeck: (deck: string) => set({ currentDeck: deck }),
      setCurrentDetected: (cnt: number) => set({ currentDetected: cnt }),
      setCurrentAddingNote: (note: Note) => set({ currentAddingNote: note }),
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
