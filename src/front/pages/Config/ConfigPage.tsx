import commonStyle from '@/front/common.module.css';
import configPageStyle from "./configPage.module.css";
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useConfigure, { Language, Theme, ThemeSetting } from '@/front/utils/useConfigure';
import useLocale from '@/front/utils/useLocale';


const ConfigPage: React.FC = () => {
  // font size, about, javascript, default Anki Connect url, default setting, default templates 
  const [_t, i18n] = useTranslation();
  const tl = useLocale('pages.ConfigPage');
  const {
    language,setLanguage, 
    themeOption, setThemeSetting,
    fontSize, setFontSize
  } = useConfigure();
  const [locale, setLocale] = useState(language);
  const [curThemeSetting, setCurThemeSetting] = useState(themeOption.userSetting);
  const [curFontSize, setCurFontSize] = useState(fontSize);
  const isUserSchemeDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
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
            const selectedTheme = e.target.value as ThemeSetting;
            setThemeSetting(selectedTheme);
            setCurThemeSetting(selectedTheme);
          }
        }
        value={curThemeSetting}
        >
          <option value={isUserSchemeDark ? ThemeSetting.SYSTEM_DARK : ThemeSetting.SYSTEM_LIGHT}>{isUserSchemeDark ?tl('SystemDark'):tl('SystemLight')}</option>
          <option value={ThemeSetting.LIGHT}>{tl('Light')}</option>
          <option value={ThemeSetting.DARK}>{tl('Dark')}</option>
        </select>
      </div>
      <div>
        <label htmlFor="fontSizeSelect">{tl('font size')}</label>
        <select name="fontSizeSelect" id="fontSizeSelect" onChange={(e)=>{
          const selectedFontSize = e.target.value;
          setFontSize(selectedFontSize);
          setCurFontSize(selectedFontSize);
        }} 
        value={curFontSize}>
          <option value="small">small</option>
          <option value="normal">normal(default)</option>
          <option value="large">large</option>
          <option value="very-large">very large</option>
        </select>
      </div>
    </div>
  );
};

export default ConfigPage;
