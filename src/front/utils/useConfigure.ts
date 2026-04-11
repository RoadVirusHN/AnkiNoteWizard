import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export enum Language {
  EN = 'en',
  KO = 'ko',
}

interface ThemeOption {
  theme: Theme;
  userSetting: ThemeSetting;
}

export enum ThemeSetting {
  NONE = 'none',
  SYSTEM_DARK = 'system-dark',
  SYSTEM_LIGHT = 'system-light',
  LIGHT = 'light',
  DARK = 'dark',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

// WARN : less than 8kb per item in chrome.storage.sync, maximum 100kb total.
interface ConfigureState {
  language: Language;
  themeOption: ThemeOption;
  fontSize: string;
  styles: { [modelName: string]: { card: string; [cards: string]: string } };
  setLanguage: (lang: Language) => void;
  setThemeSetting: (themeSetting: ThemeSetting) => void;
  setFontSize: (fontSize: string) => void;
  setStyles: (modelName: string, key: string, newStyle: string) => void;
}
// TODO : Move style setting to local storage. 
const DEFAULT_STYLE = `
  font-family: arial;
  font-size: 20px;
  text-align: center;
  color: black;
  background-color: white;
`;

const useConfigure = create<ConfigureState>()(
  persist(
    (set) => ({
      language: Language.EN,
      themeOption: {
        theme: Theme.LIGHT,
        userSetting: ThemeSetting.NONE,
      },
      fontSize: 'normal',
      styles: {
        basic:{
          card: DEFAULT_STYLE
        }
      },
      setLanguage: (lang: Language) => {
        set({ language: lang });
      },
      setThemeSetting: (themeSetting: ThemeSetting) => {
        let newThemeOption = {
          theme: Theme.LIGHT,
          userSetting: themeSetting,
        };
        switch (themeSetting) {
          case ThemeSetting.DARK: case ThemeSetting.SYSTEM_DARK:
            document.documentElement.setAttribute('data-theme', 'dark');
            newThemeOption.theme = Theme.DARK;
            break;
          default:
            document.documentElement.setAttribute('data-theme', 'light');
            break;
        }
        set({ themeOption: newThemeOption });
      },
      setFontSize: (fontSize: string) => {
        const html = document.documentElement;
        html.classList.remove('font-small', 'font-normal', 'font-large', 'font-very-large');
        html.classList.add(`font-${fontSize}`);
        set({ fontSize: fontSize });
      },
      setStyles: (modelName:string, key:string, newStyle:string) => {
        set((state) => {
          const newStyles = { ...state.styles };
          if (!newStyles[modelName]) {
            newStyles[modelName] = { card: DEFAULT_STYLE };
          }
          newStyles[modelName][key] = newStyle;
          return { styles: newStyles };
        });
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