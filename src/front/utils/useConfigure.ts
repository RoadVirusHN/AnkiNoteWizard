import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export enum Language {
  EN = 'en',
  KO = 'ko',
}

export enum Theme {
  SYSTEM = 'system',
  LIGHT = 'light',
  DARK = 'dark',
}


// WARN : less than 8kb per item in chrome.storage.sync, maximum 100kb total.
interface ConfigureState {
  language: Language;
  theme: Theme;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
}

const useConfigure = create<ConfigureState>()(
  persist(
    (set) => ({
      language: Language.EN,
      theme: Theme.SYSTEM,
      setLanguage: (lang: Language) => {
        console.log("Setting language to:", lang);
        set({ language: lang });
      },
      setTheme: (theme: Theme) => {
        set({ theme });
        switch (theme) {
          case Theme.LIGHT:
            document.documentElement.setAttribute('data-theme', 'light');
            break;
          case Theme.DARK:
            document.documentElement.setAttribute('data-theme', 'dark');
            break;
          case Theme.SYSTEM:
          default:
            document.documentElement.removeAttribute('data-theme');
            break;
        
        }
      }
    }),
    {
      name: 'anki-card-wizard-configure-store',
      storage: {
        getItem: async (name) => (await chrome.storage.sync.get(name))[name],
        setItem: async (name, value) => await chrome.storage.sync.set({ [name]: value }),
        removeItem: async (name) => await chrome.storage.sync.remove(name),
      },
    }
  )
);

export default useConfigure;