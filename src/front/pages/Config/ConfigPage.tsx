import commonStyle from '@/front/common.module.css';
import configPageStyle from "./configPage.module.css";
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useConfigure, { Language, Theme } from '@/front/utils/useConfigure';
import useLocale from '@/front/utils/useLocale';


const ConfigPage: React.FC = () => {
  // font size, about, javascript, default Anki Connect url, default setting, default templates 
  const [_t, i18n] = useTranslation();
  const tl = useLocale('pages.ConfigPage');
  const {language, theme, isUserSchemeDark,setLanguage, setTheme} = useConfigure();
  const [locale, setLocale] = useState(language);
  const [curTheme, setCurTheme] = useState(theme);
  console.log("ConfigPage render, language:", language, "theme:", theme);
  console.log("ConfigPage render", "storage theme:", curTheme);

  return (
    <div>
      <div>
        <label htmlFor='locale-select'>{tl('Locale')}</label>
        <select name='locale' id='locale-select' onChange={(e)=>{
          const selectedLocale = e.target.value as Language;
          setLocale(selectedLocale);
          i18n.changeLanguage(selectedLocale);
          setLanguage(selectedLocale);        
        }}
        value={locale}>
          <option value={Language.EN}>English</option>
          <option value={Language.KO}>한국어</option>
        </select>
      </div>  
      <div>
        <label htmlFor="theme-select">{tl('Theme')}</label>
        <select name="theme" id="theme-select" onChange={
          (e)=>{
            const selectedTheme = e.target.value as Theme;
            setTheme(selectedTheme);
            setCurTheme(selectedTheme);
          }
        }
        value={curTheme}
        >
          <option value={isUserSchemeDark ? Theme.SYSTEM_DARK : Theme.SYSTEM_LIGHT}>{isUserSchemeDark ?tl('SystemDark'):tl('SystemLight')}</option>
          <option value={Theme.LIGHT}>{tl('Light')}</option>
          <option value={Theme.DARK}>{tl('Dark')}</option>
        </select>
      </div>
    </div>
  );
};

export default ConfigPage;
