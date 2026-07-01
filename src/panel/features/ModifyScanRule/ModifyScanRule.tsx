import useScanRules from "@/panel/stores/useScanRule";
import { useParams } from "react-router";
import { useEffect, useState } from "react";
import modifyScanRuleStyle from "./modifyScanRule.module.css";
import ScanRuleFieldEditor from "./ScanRuleFieldEditor/ScanRuleFieldEditor";
import ScanRuleMetaEditor from "./ScanRuleMetaEditor/ScanRuleMetaEditor";
import ScanRuleCommonEditor from "./ScanRuleCommonEditor/ScanRuleCommonEditor";
import ModifyScanRuleHeader from "./ModifyScanRuleHeader/ModifyScanRuleHeader";
import { ScanRule, FIELD_DATA_TYPES, SELECTOR_TYPES } from "@/types/scanRule.types";
import { EMPTY_MODEL, SCAN_RULE_CODE } from "@/types/app.types";
import useAnkiConnectionStore from "@/panel/stores/useAnkiConnectionStore";
import { useTranslation } from "react-i18next";

const emptyScanRule: ScanRule = {
    scanRuleName: "",
    meta: { author: "", description: "", version: "0.0.1" },
    modelId: EMPTY_MODEL.id,
    urlPattern: "*",
    rootTagSelector: "div.word",
    fields: {},
    tagIds: []
  };


const ModifyScanRule = () => {
  const { index } = useParams();
  const isEditMode = index !== undefined;
  const idx = isEditMode ? index : undefined;
  const { addScanRule, modifyScanRule, scanRules } = useScanRules();
  const currentScanRule = isEditMode && idx !== undefined ? (scanRules[idx]??emptyScanRule) : emptyScanRule;
  const {t} = useTranslation('page', {keyPrefix: 'modifyScanRule'});
  const tabs = ["meta", "common", "fields"] as ("meta" | "common" | "fields")[];
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const {models} = useAnkiConnectionStore();
  if (currentScanRule.modelId===EMPTY_MODEL.id&&Object.keys(models).length>0){
    const firstKey = Object.keys(models)[0];
    models[firstKey].fields.map((fieldName)=>{
      currentScanRule.fields[fieldName] = [{
        content: "",
        selectorType: SELECTOR_TYPES.CSS,
        dataType: FIELD_DATA_TYPES.TEXT
      }];
    });
    currentScanRule.modelId = models[firstKey].id;
  }
  const [scanRuleData, setScanRuleData] = useState<ScanRule>(currentScanRule);
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const changeScanRuleData = (updatedData: ScanRule) => {
    setIsChanged(true);
    if (updatedData.modelId!==scanRuleData.modelId){
      models[updatedData.modelId]?.fields.map((fieldName)=>{
        updatedData.fields[fieldName] = [{
          content: "",
          selectorType: SELECTOR_TYPES.CSS,
          dataType: FIELD_DATA_TYPES.TEXT
        }];
      });
    }      
    setScanRuleData(updatedData);
  };
  const handleSave = () => {
    console.log(isEditMode && idx !== undefined);
    console.log(scanRuleData);
    const code = isEditMode && idx !== undefined ? 
    modifyScanRule(idx, scanRuleData) :
    addScanRule(scanRuleData);
    if (code.result === 'success') {
      setIsChanged(false);
    } else {
      alert(`Error occurred: ${code.error}`);
      return;
    }
  };

  const handleCancle = () => {
    setScanRuleData(currentScanRule);
    setIsChanged(false);
  };
  const isDisabled = Object.keys(models).length===0||!scanRuleData.fields || Object.keys(scanRuleData.fields).length === 0;

return (
    <div className={modifyScanRuleStyle.container}>
      <ModifyScanRuleHeader 
        title={isEditMode ? t("modifyScanRule") : t("newScanRule")}
        isChanged={isChanged}
        onSave={handleSave}
        onCancle={handleCancle}
      />
      <div className={modifyScanRuleStyle.tabs}>
        {tabs.map(tab => 
          <button
            key={tab}
            className={`${modifyScanRuleStyle.tab} ${activeTab === tab ? modifyScanRuleStyle.activeTab : ""}`}
            onClick={() => {
              if (isDisabled && tab === "fields" ) {
                alert(t("fieldTabDisabledTooltip"));
                return;
              }
              setActiveTab(tab);
            }}
            title={isDisabled && tab === "fields" ? t("fieldTabDisabledTooltip") : undefined}
            style={{cursor: isDisabled && tab === "fields" ? "not-allowed" : "pointer", color: isDisabled && tab === "fields" ? "var(--color-warning)" : "inherit"}}
          >
            {t(tab)}
          </button>)}
      </div>
      <div className={modifyScanRuleStyle.content}>        
        {activeTab === "meta" && (
          <ScanRuleMetaEditor 
            data={scanRuleData} 
            setData={changeScanRuleData}/>)}
        {activeTab === "common" && (
          <ScanRuleCommonEditor 
            scanRule={scanRuleData} 
            setData={changeScanRuleData}/>)}
        {activeTab === "fields" && (
          <ScanRuleFieldEditor
            scanRule={scanRuleData}
            setData={changeScanRuleData}
          />
        )}
      </div>
    </div>
  );
};

export default ModifyScanRule;
