import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Note } from './useTemplates';

export enum Tab {
  DETECT = 'DETECT',
  ADD = 'ADD',
  HISTORY = 'HISTORY',
  TEMPLATES = 'TEMPLATES',
  CONFIG = 'CONFIG',
}

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
      currentTab: Tab.DETECT,
      currentDeck: '',
      isAddingCard: false,
      currentDetected: 0,
      currentAddingNote: {
        templateName: '',
        deckName: '',
        modelName: 'Basic',
        fields: {
          Front: '',
          Back: '',
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
