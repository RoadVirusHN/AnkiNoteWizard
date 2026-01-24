import { RouterProvider } from "react-router";
import AnkiRouter from "./router/AnkiRouter";
import { useEffect, useState } from "react";
import useGlobalVarStore from "./utils/useGlobalVarStore";
import useConfigure, { Theme } from "./utils/useConfigure";
import i18n from './locales/i18n';

const App = ({}) => {
  const {currentUrl} = useGlobalVarStore();
  const [router, setRouter] =  useState<ReturnType<typeof AnkiRouter>| null>(null);
  const {language, theme, setTheme, setIsUserSchemeDark} = useConfigure();

  useEffect(()=>{
    setRouter(AnkiRouter(currentUrl || '/'));
    if (language) {
      console.log("App.tsx setting i18n language to:", language);
      i18n.changeLanguage(language);
    }
    if (theme===Theme.NONE||theme===Theme.SYSTEM_DARK||theme===Theme.SYSTEM_LIGHT) {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsUserSchemeDark(isDark);
      setTheme(isDark ? Theme.SYSTEM_DARK: Theme.SYSTEM_LIGHT);
    }
    if (theme===Theme.DARK||theme===Theme.SYSTEM_DARK) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);
  return router ? <RouterProvider router={router}/> : null;
};
export default App;