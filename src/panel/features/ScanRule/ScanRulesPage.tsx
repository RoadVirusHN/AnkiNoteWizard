import Icon from "@/panel/components/Icon/Icon";
import ScanRuleDetail from "@/panel/features/ScanRule/ScanRuleDetail/ScanRuleDetail";
import useScanRule from "@/panel/stores/useScanRule";
import scanRulesStyle from "./scanRules.module.css";
import AddIcon from "@/public/Icon/Icon-Add.svg";
import DumpSvg from "@/public/Icon/Icon-Dump.svg";
import { useState } from "react";
import { useNavigate } from "react-router";
import SimpleButton from "@/panel/components/Inputs/SimpleButton/SimpleButton";
import { useTranslation } from "react-i18next";
import { ScanRule } from "@/types/scanRule.types";

const ScalnRulePage = ({}) => {
  const {removeScanRule, scanRules, addScanRule} = useScanRule();  
  const navigate = useNavigate();
  const [checkedList, setCheckedList] = useState<string[]>([]);
  const {t} = useTranslation('page', {keyPrefix: 'configPage'});
  const {t: tScanRulesPage} = useTranslation('page', {keyPrefix: 'scanRulesPage'});
  return (<div className={scanRulesStyle.container}>
    <Icon url={AddIcon} handleClick={()=>{
      navigate("/scanRules/modify");
    }}
    style={{cursor: "pointer"}}
    title={tScanRulesPage('addScanRule')}
    />  
    {Object.values(scanRules).map((scanRule)=>
    <ScanRuleDetail key={scanRule.scanRuleName} idx={scanRule.scanRuleName} scanRule={scanRule} onCheck={(e)=>{
      if (e.currentTarget.checked){
        setCheckedList([...checkedList, scanRule.scanRuleName]);
      } else {
        setCheckedList(checkedList.filter(name=>name!==scanRule.scanRuleName));
      }
    }} />)}
    <div className={scanRulesStyle.buttonGroup}>
      {
        checkedList.length > 0 &&
        <>
          <SimpleButton src={DumpSvg} title={"Delete"} onClick={()=>{
            if (confirm(tScanRulesPage('Deleting|count|scanRules', {count: checkedList.length}))){
              for (let scanRuleName of checkedList){
                removeScanRule(scanRuleName);
              }
            }
          }}/>
          <SimpleButton text={t('exportScanRules')} onClick={()=>{
            const checkedScanRules = Object.keys(scanRules).filter(scanRule=>checkedList.includes(scanRule));
            const blob = new Blob([JSON.stringify(checkedScanRules, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'scanRules.json';
            a.click();
          }}/>
        </>
      }
      <SimpleButton text={t('importScanRules')} onClick={()=>{
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
                const copiedScanrules = [...Object.values(scanRules)];
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
      }} />
    </div>
    {/* Spacer for fixed Buttons */}
    <div style={{height: "25px"}}/>
  </div>);
};
export default ScalnRulePage;
