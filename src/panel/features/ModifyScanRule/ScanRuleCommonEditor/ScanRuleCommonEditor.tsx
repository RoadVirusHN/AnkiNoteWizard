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
    setData({ ...scanRule, rootTagSelector: text });
    if (rootTagInputRef.current){
      rootTagInputRef.current.value = text;
    };
  }
  const {models} = useAnkiConnectionStore();
  const {enterInspectionMode, cancleInspectionMode, isInspectionMode} = useInspection(INSPECTION_MODE.TAG_EXTRACTION, scanRule.rootTagSelector );
  
  const options = models
    ? Object.entries(models).map(([modelId, model]) => ({ key: model.name, val: modelId, isDisabled: false }))
    : [{ key: tCommon("ankiDisconnected"), val: "", isDisabled: true }];
  
  return (<div>
    <ModelInput
      errorMessages={[]}
      defaultModelId={scanRule.modelId}
      setModelId={(id) => {
        let newFields = {};
        newFields = Object.fromEntries(models[id].fields.map((field:string) => [field, { selector: "", dataType: "text" }])); 
        setData({ ...scanRule, modelId: id, fields: newFields});
      }}
    />
    <SimpleInput 
      inputId="urlPatterns"
      isEssential={true}
      label={t("urlPatterns")} 
      placeholder={"*"} 
      defaultValue={scanRule.urlPatterns.join(", ")} 
      onChange={(e) => ({ ...scanRule, urlPatterns: e.target.value.split(",").map(s=>s.trim()) })}
    />
    <Tags givenTagIds={scanRule.tagIds} isModifying={true} onAddTag={
      (newTag) => {
        if (!scanRule.tagIds.includes(newTag.name)) {
          setData({ ...scanRule, tagIds: [...scanRule.tagIds, newTag.name] });
        }
      }
    } onRemoveTag={
      (tagToRemove) => {
        setData({ ...scanRule, tagIds: scanRule.tagIds.filter(id => id !== tagToRemove.name) });
      }
    }/>
    {/* TODO: style 연구해서 개구린 기본 Simple 시리즈 개선 */}
    <div className={modifyScanRuleStyle.formGroup}>
      <label>{t("rootTag")} <span className={modifyScanRuleStyle.req}>*</span></label>
      <div className={modifyScanRuleStyle.inputWithBtn}>
        <input
          className={modifyScanRuleStyle.input}
          value={scanRule.rootTagSelector}
          onChange={(e) => setData({ ...scanRule, rootTagSelector: e.target.value })}
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