import commonStyle from '@/panel/common.module.css';
import configPageStyle from "./configPage.module.css";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useConfigure from '@/panel/stores/useConfigure';
import { LOCALE, Locale, THEME_SETTING, ThemeSetting } from '@/types/app.types';
import useAnkiConnectionStore from '@/panel/stores/useAnkiConnectionStore';
import SimpleButton from '@/panel/components/Inputs/SimpleButton/SimpleButton';
import useScanRule from '@/panel/stores/useScanRule';
import { defaultScanRules } from '@/background/constants';
import { ScanRule } from '@/types/scanRule.types';


const ConfigPage: React.FC = () => {
  // font size, about, javascript, default Anki Connect url, default setting, default scanRules 
  const {t} = useTranslation('page', {keyPrefix: 'configPage'});
  const {
    locale,setLocale, 
    themeOption, setThemeSetting,
    fontSize, setFontSize
  } = useConfigure();
  const {scanRules, addScanRule} = useScanRule();
  const {ankiUrl, setAnkiUrl} = useAnkiConnectionStore();
  const [curLocale, setCurLocale] = useState(locale);
  const [curThemeSetting, setCurThemeSetting] = useState(themeOption.userSetting);
  const [curFontSize, setCurFontSize] = useState(fontSize);
  const [curAnkiUrl, setCurAnkiUrl] = useState(ankiUrl);
  const hasChanges = locale !== curLocale || curThemeSetting !== themeOption.userSetting || curFontSize !== fontSize;
  const isUserSchemeDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return (
    <div>
      <div>
        <label htmlFor='locale-select'>{t('locale')}</label>
        <select name='locale' id='locale-select' onChange={(e)=>{
          const selectedLocale = e.target.value as Locale;
          setCurLocale(selectedLocale);
        }}
        value={curLocale}>
          <option value={LOCALE.EN}>English</option>
          <option value={LOCALE.KO}>한국어</option>
        </select>
      </div>  
      <div>
        <label htmlFor="theme-select">{t('theme')}</label>
        <select name="theme" id="theme-select" onChange={
          (e)=>{
            const selectedTheme = e.target.value as ThemeSetting;
            setCurThemeSetting(selectedTheme);
          }
        }
        value={curThemeSetting}
        >
          <option value={isUserSchemeDark ? THEME_SETTING.SYSTEM_DARK : THEME_SETTING.SYSTEM_LIGHT}>{isUserSchemeDark ?t('themeSystemDark'):t('themeSystemLight')}</option>
          <option value={THEME_SETTING.LIGHT}>{t('themeLight')}</option>
          <option value={THEME_SETTING.DARK}>{t('themeDark')}</option>
        </select>
      </div>
      <div>
        <label htmlFor="fontSizeSelect">{t('fontSize')}</label>
        <select name="fontSizeSelect" id="fontSizeSelect" onChange={(e)=>{
          const selectedFontSize = e.target.value;
          setCurFontSize(selectedFontSize);
        }} 
        value={curFontSize}>
          <option value="small">small</option>
          <option value="normal">normal(default)</option>
          <option value="large">large</option>
          <option value="very-large">very large</option>
        </select>
      </div>
      <div>
        <label htmlFor="Anki-URL">{"Anki URL"}</label>
        <input type="text" name="Anki-URL" onChange={(e)=>{
          setCurAnkiUrl(e.target.value);
        }} value={curAnkiUrl} />
      </div>
      <SimpleButton onClick={()=>{
        var addedScanruleCount = 0;
        const copiedScanrules = [...scanRules];
        for (const rule of defaultScanRules) {
          if (!copiedScanrules.find(r => r.scanRuleName === rule.scanRuleName)) {
            addScanRule(rule);
            addedScanruleCount++;
          }
        }
        alert(t('|count|addedDefaultDataCount', {count: addedScanruleCount}));
      }}>
        {t('addDefaultData')}
      </SimpleButton>
      <div className={configPageStyle.floatingBtnContainer}>
        <SimpleButton onClick={()=>{
          setLocale(curLocale);
          setThemeSetting(curThemeSetting);
          setFontSize(curFontSize);  
          setAnkiUrl(curAnkiUrl);
        }} 
          style={{display: hasChanges ? 'inline-block' : 'none'}}
        >
          {t('apply')}
        </SimpleButton>
        <SimpleButton onClick={()=>{
          setCurLocale(locale);
          setCurThemeSetting(themeOption.userSetting);
          setCurFontSize(fontSize);
        }}
        style={{display: hasChanges ? 'inline-block' : 'none'}}
        >
          {t('cancle')}
        </SimpleButton>
        <SimpleButton onClick={()=>{
          if (confirm(t('confirmResetToDefault'))) {
            const uiLocale = chrome.i18n.getUILanguage();
            const defaultLocale = uiLocale.startsWith('ko') ? LOCALE.KO : LOCALE.EN;
            setLocale(defaultLocale);
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (themeOption.userSetting === THEME_SETTING.SYSTEM_LIGHT ||themeOption.userSetting===THEME_SETTING.SYSTEM_DARK||themeOption.userSetting===THEME_SETTING.NONE) {
              setCurThemeSetting(isDark ? THEME_SETTING.SYSTEM_DARK : THEME_SETTING.SYSTEM_LIGHT);
            }
            setCurFontSize('normal');
          }
        }}>
          {t('default')}
        </SimpleButton>
        <SimpleButton onClick={()=>{
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'application/json';
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
              try {
                console.log(event.target?.result);
                const importedScanRules = JSON.parse(event.target?.result as string) as ScanRule[];
                console.log(importedScanRules);

                const copiedScanrules = [...scanRules];
                if (Array.isArray(importedScanRules)) {
                  var addedCount = 0;
                  for (const rule of importedScanRules) {
                    if (!copiedScanrules.find(r => r.scanRuleName === rule.scanRuleName)) {
                      addScanRule(rule);
                      addedCount++;
                    }
                  }
                  alert(t('|count|addedDefaultDataCount', {count: addedCount}));
                } else {
                  alert('Invalid file format');
                }
              } catch (error) {
                alert('Error reading file');
              }
            };
            reader.readAsText(file);
          };
          input.click();
        }}>
          {t('importScanRules')}
        </SimpleButton>
        <SimpleButton onClick={()=>{
          const blob = new Blob([JSON.stringify(scanRules, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'scanRules.json';
          a.click();
        }}>
          {t('exportScanRules')}
        </SimpleButton>
      </div>

    </div>
  );
};

export default ConfigPage;
