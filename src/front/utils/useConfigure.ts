import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export enum Language {
  EN = 'en',
  KO = 'ko',
}

export enum Theme {
  NONE = 'none',
  SYSTEM_DARK = 'system-dark',
  SYSTEM_LIGHT = 'system-light',
  LIGHT = 'light',
  DARK = 'dark',
}


// WARN : less than 8kb per item in chrome.storage.sync, maximum 100kb total.
interface ConfigureState {
  language: Language;
  theme: Theme;
  isUserSchemeDark: boolean;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  setIsUserSchemeDark: (scheme: boolean) => void;
}

const useConfigure = create<ConfigureState>()(
  persist(
    (set) => ({
      language: Language.EN,
      theme: Theme.NONE,
      isUserSchemeDark: false,
      setLanguage: (lang: Language) => {
        set({ language: lang });
      },
      setTheme: (theme: Theme) => {
        set({ theme });
        switch (theme) {
          case Theme.LIGHT: case Theme.SYSTEM_LIGHT:
            document.documentElement.setAttribute('data-theme', 'light');
            break;
          case Theme.DARK: case Theme.SYSTEM_DARK:
            document.documentElement.setAttribute('data-theme', 'dark');
            break;
          default:
            document.documentElement.setAttribute('data-theme', 'light');
            break;
        }
      },
      setIsUserSchemeDark: (scheme: boolean) => {
        set({ isUserSchemeDark: scheme });
      },
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