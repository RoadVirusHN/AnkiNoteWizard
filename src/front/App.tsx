import { RouterProvider } from "react-router";
import AnkiRouter from "./router/AnkiRouter";
import { useEffect, useState } from "react";
import useGlobalVarStore from "./utils/useGlobalVarStore";
import useConfigure, { Theme, ThemeSetting } from "./utils/useConfigure";
import i18n from './locales/i18n';

const App = ({}) => {
  const {currentUrl} = useGlobalVarStore();
  const [router, setRouter] =  useState<ReturnType<typeof AnkiRouter>| null>(null);
  const {language, themeOption, setThemeSetting, fontSize} = useConfigure();

  useEffect(()=>{
    setRouter(AnkiRouter(currentUrl || '/'));
    if (language) {
      console.log("App.tsx setting i18n language to:", language);
      i18n.changeLanguage(language);
    }
    // set theme based on system preference if userSetting is system-based or none.
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (themeOption.userSetting === ThemeSetting.SYSTEM_LIGHT ||themeOption.userSetting===ThemeSetting.SYSTEM_DARK||themeOption.userSetting===ThemeSetting.NONE) {
      setThemeSetting(isDark ? ThemeSetting.SYSTEM_DARK : ThemeSetting.SYSTEM_LIGHT);
    }
    if (themeOption.theme===Theme.DARK) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    const html = document.documentElement;
    html.classList.remove('font-small', 'font-normal', 'font-large', 'font-very-large');
    html.classList.add(`font-${fontSize}`);
  }, []);
  return router ? <RouterProvider router={router}/> : null;
};
export default App;