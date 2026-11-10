import { ScanRule } from "@/types/scanRule.types";
import modifyScanRuleStyle from "../modifyScanRule.module.css";
import SimpleInput from "@/panel/components/Inputs/SimpleInput/SimpleInput";
import { useTranslation } from "react-i18next";

interface Props {
  data : ScanRule;
  setData: (data: ScanRule) => void;
}
const ScanRuleMetaEditor = ({data, setData}:Props) => {  
  
  const updateMeta = (key: string, value: unknown) => {
    setData({ ...data, meta: { ...data.meta, [key]: value } });
  };
  const {t} = useTranslation('page', { keyPrefix: 'modifyScanRule.scanRuleMetaEditor' }); 
  return (<div className={modifyScanRuleStyle.settingsForm}>
    <SimpleInput 
      inputId="scanRuleName"
      isEssential={true}
      label={t("scanRuleName")} 
      placeholder="e.g. eng-kor-words"
      defaultValue={data.scanRuleName}
      onChange={(e) => setData({ ...data, scanRuleName: e.target.value })}
    />

  <div className={modifyScanRuleStyle.row}>
    <SimpleInput 
      inputId="author"
      label={t("author")} 
      defaultValue={data.meta.author || ""}
      onChange={(e) => updateMeta("author", e.target.value)}
    />
    <SimpleInput
      inputId="version"
      label={t("version")}
      defaultValue={data.meta.version || ""}
      onChange={(e) => updateMeta("version", e.target.value)}
    />
  </div>
    
  
  {/* TODO : Quill js */}
  <div className={modifyScanRuleStyle.formGroup}>
    <label htmlFor="description">{t("description")}</label>

    <textarea
      className={modifyScanRuleStyle.textarea}
      name="description"
      style={{height:'100%'}}
      value={data.meta.description || ""}
      onChange={(e) => updateMeta("description", e.target.value)}
      autoComplete="on"
      autoCorrect="on"
      maxLength={4096}

    />
  </div>
</div>);
};
export default ScanRuleMetaEditor;