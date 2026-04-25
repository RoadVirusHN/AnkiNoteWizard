import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Note } from 'types/scanRule.types';
import { TAB, Tab } from '@/types/app.types';


interface GlobalVarState {
  currentUrl: string;
  currentTab: Tab;
  currentDeck: string;
  isAddingCard: boolean;
  currentDetected: number;
  currentAddingNote: Note;
  setCurrentUrl: (url: string) => void;
  setCurrentTab: (tab: Tab) => void;
  setCurrentDeck: (deck: string) => void;
  setCurrentDetected: (cnt: number) => void;
  setCurrentAddingNote: (note: Note) => void;
  setIsAddingCard: (isAdding: boolean) => void;
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
        modelId: 'Basic',
        fields: {
          Front: 'Front sample',
          Back: 'Back sample',
        },
        tags: [],
      },
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
