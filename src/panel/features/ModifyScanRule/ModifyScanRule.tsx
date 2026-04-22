import useScanRules from "@/panel/stores/useScanRule";
import { useParams } from "react-router";
import { useState } from "react";
import modifyScanRuleStyle from "./modifyScanRule.module.css";
import ScanRuleFieldEditor from "./ScanRuleFieldEditor/ScanRuleFieldEditor";
import ScanRuleMetaEditor from "./ScanRuleMetaEditor/ScanRuleMetaEditor";
import ScanRuleCommonEditor from "./ScanRuleCommonEditor/ScanRuleCommonEditor";
import ModifyScanRuleHeader from "./ModifyScanRuleHeader/ModifyScanRuleHeader";
import useLocale from "@/panel/hooks/useLocale";
import { ScanRule, FIELD_DATA_TYPES } from "@/types/scanRule.types";
import { Default_BASIC_MODEL, SCAN_RULE_CODE } from "@/types/app.types";
import useAnkiConnectionStore from "@/panel/stores/useAnkiConnectionStore";

const emptyScanRule: ScanRule = {
    scanRuleName: "",
    meta: { author: "", description: "", version: "0.0.1" },
    modelId: Default_BASIC_MODEL.id,
    urlPatterns: ["*"],
    rootTag: "div.word",
    fields: {
      ...Object.fromEntries(Default_BASIC_MODEL.fields.map(field => [field, { selector: `div.${field.toLowerCase()}`, dataType: FIELD_DATA_TYPES.TEXT }]))
    },
    tags: []
  };


const ModifyScanRule = () => {
  const { index } = useParams();
  const isEditMode = index !== undefined;
  const idx = isEditMode ? parseInt(index) : undefined;
  const { scanRules, addScanRule, modifyScanRule } = useScanRules();
  const { models } = useAnkiConnectionStore();
  const currentScanRule = isEditMode && idx !== undefined ? scanRules[idx] : emptyScanRule;
  const currentModel = models[currentScanRule.modelId] || { fields: [] };  
  const tl = useLocale('pages.ModifyScanRule');
  const tabs = ["meta", "common", "fields"];
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [scanRuleData, setScanRuleData] = useState<ScanRule>(currentScanRule);
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const changeTemplatData = (updatedData: ScanRule) => {
    setIsChanged(true);
    setScanRuleData(updatedData);
  };
  const handleSave = () => {
    const code = isEditMode && idx !== undefined ? 
      modifyScanRule(scanRules[idx].scanRuleName, scanRuleData) :
      addScanRule(scanRuleData);
    if (code=== SCAN_RULE_CODE.OK) {
      setIsChanged(false);
    } else {
      alert(`Error occurred: ${code}`);
      return;
    }
  };

  const handleCancle = () => {
    setScanRuleData(currentScanRule);
    setIsChanged(false);
  };
  

return (
    <div className={modifyScanRuleStyle.container}>
      <ModifyScanRuleHeader 
        title={isEditMode ? tl("modify scanRule") : tl("new scanRule")}
        isChanged={isChanged}
        onSave={handleSave}
        onCancle={handleCancle}
      />
      <div className={modifyScanRuleStyle.tabs}>
        {tabs.map(tab => 
          <button
            key={tab}
            className={`${modifyScanRuleStyle.tab} ${activeTab === tab ? modifyScanRuleStyle.activeTab : ""}`}
            onClick={() => setActiveTab(tab)}>
            {tl(tab)}
          </button>)}
      </div>
      <div className={modifyScanRuleStyle.content}>        
        {activeTab === "meta" && (
          <ScanRuleMetaEditor 
            data={scanRuleData} 
            setData={changeTemplatData}/>)}
        {activeTab === "common" && (
          <ScanRuleCommonEditor 
            data={scanRuleData} 
            setData={changeTemplatData}/>)}
        {activeTab === "field" && (
          <ScanRuleFieldEditor
            fieldName={activeTab}
            scanRule={scanRuleData}
            setData={(newData) => {
              setScanRuleData(
                {
                  ...scanRuleData,
                  fields: scanRuleData.fields.map(f => f.name.toLowerCase() === activeTab ? { ...f, ...newData } : f)
                }
              );
              setIsChanged(true);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ModifyScanRule;
