import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export enum Tab {
  DETECT = 'DETECT',
  ADD = 'ADD',
  HISTORY = 'HISTORY',
  CUSTOM = 'CUSTOM',
  CONFIG = 'CONFIG',
}

interface GlobalVarState {
  currentTab: Tab;
  currentDeck: string;
  isAddingCard: boolean;
  currentDetected: number;
  setCurrentTab: (tab: Tab) => void;
  setCurrentDeck: (deck: string) => void;
  setCurrentDetected: (cnt: number) => void;
  setIsAddingCard: (isAdding: boolean) => void;
}

const useGlobalVarStore = create<GlobalVarState>()(
  persist(
    (set) => ({
      currentTab: Tab.DETECT,
      currentDeck: '',
      isAddingCard: false,
      currentDetected: 0,
      setCurrentTab: (tab: Tab) => set({ currentTab: tab }),
      setCurrentDeck: (deck: string) => set({ currentDeck: deck }),
      setCurrentDetected: (cnt: number) => set({ currentDetected: cnt }),
      setIsAddingCard: (isAdding: boolean) => set({ isAddingCard: isAdding }),
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

export default useGlobalVarStore;
