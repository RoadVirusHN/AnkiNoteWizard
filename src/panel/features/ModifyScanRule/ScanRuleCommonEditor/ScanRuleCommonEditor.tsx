import modifyScanRuleStyle from "../modifyScanRule.module.css";
import Tags from "@/panel/components/Tags/Tags";
import { useRef } from "react";
import InspectionOverlay from "@/panel/components/InspectionOverlay/InspectionOverlay";
import MagicIcon from "@/public/Icon/Icon-Magic.svg";
import useInspection from "@/panel/hooks/useInspection";
import { ScanRule } from "@/types/scanRule.types";
import { INSPECTION_MODE } from "@/types/app.types";
import useAnkiConnectionStore from "@/panel/stores/useAnkiConnectionStore";
import SimpleButton from "@/panel/components/Inputs/SimpleButton/SimpleButton";
import SimpleInput from "@/panel/components/Inputs/SimpleInput/SimpleInput";
import { useTranslation } from "react-i18next";
import ModelInput from "@/panel/components/Inputs/ModelInput/ModelInput";

interface Props {
  scanRule : ScanRule;
  setData: (data: ScanRule) => void;
}

const ScanRuleCommonEditor = ({scanRule, setData}:Props) => {

  const rootTagInputRef = useRef<HTMLInputElement>(null);
  const {t} = useTranslation('page', {keyPrefix: 'modifyScanRule.scanRuleCommonEditor'});
  const {t:tCommon} = useTranslation('common');
  const onResult = (text: string)=>{
    setData({ ...scanRule, rootTag: text });
    if (rootTagInputRef.current){
      rootTagInputRef.current.value = text;
    };
  }
  const {models} = useAnkiConnectionStore();
  const {enterInspectionMode, cancleInspectionMode, isInspectionMode} = useInspection(INSPECTION_MODE.TAG_EXTRACTION, scanRule.rootTag );
  
  const options = models
    ? Object.entries(models).map(([modelId, model]) => ({ key: model.name, val: modelId, isDisabled: false }))
    : [{ key: tCommon("ankiDisconnected"), val: "", isDisabled: true }];
  
  return (<div>
    <ModelInput
      defaultModelId={scanRule.modelId}
      setModelId={(modelId) => {
        setData({ ...scanRule, modelId, modelName: models[modelId].name, fields: Object.fromEntries(models[modelId].fields.map((field:string) => [field, { selector: "", dataType: "text" }])) });
      }}
    />
    <SimpleInput 
      inputId="urlPatterns"
      label={t("urlPatterns")} 
      placeholder={"*"} 
      defaultValue={scanRule.urlPatterns.join(", ")} 
      onChange={(e) => ({ ...scanRule, urlPatterns: e.target.value.split(",").map(s=>s.trim()) })}
    />
    <Tags givenTags={scanRule.tags} isModifying={true} onAddTag={
      (newTag) => {
        if (!scanRule.tags.includes(newTag)) {
          setData({ ...scanRule, tags: [...scanRule.tags, newTag] });
        }
      }
    } onRemoveTag={
      (tagToRemove) => {
        setData({ ...scanRule, tags: scanRule.tags.filter(tag => tag !== tagToRemove) });
      }
    }/>
    <div className={modifyScanRuleStyle.formGroup}>
      <label>{t("rootTag")} <span className={modifyScanRuleStyle.req}>*</span></label>
      <div className={modifyScanRuleStyle.inputWithBtn}>
        <input
          className={modifyScanRuleStyle.input}
          value={scanRule.rootTag}
          onChange={(e) => setData({ ...scanRule, rootTag: e.target.value })}
          ref={rootTagInputRef}
          placeholder="e.g. div.card-body"
        />
      <SimpleButton title="Extract Tag Selector" src={MagicIcon} onClick={()=>enterInspectionMode(onResult)}/> 
     </div>
      <p className={modifyScanRuleStyle.hint}>{t("rootTagDescription")}</p>
    </div>
    {isInspectionMode && <InspectionOverlay mode={INSPECTION_MODE.TAG_EXTRACTION} cancleInspectionMode={cancleInspectionMode}/>}
  </div>);
};
export default ScanRuleCommonEditor;