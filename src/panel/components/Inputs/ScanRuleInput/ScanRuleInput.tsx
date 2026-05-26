import { useState } from "react";
import useScanRule from "@/panel/stores/useScanRule";
import SimpleSelect from "../SimpleSelect/SimpleSelect";
import { useTranslation } from "react-i18next";

const ScanRuleInput = ({setScanRule, defaultScanRule}:{setScanRule: (model:string)=>void, defaultScanRule: string}) => {
  const {scanRules: scanRules} = useScanRule();
  const [curVal, setCurVal] = useState(defaultScanRule || 'Empty'); 
  const onChangeModel = (scanRule:string) => {
    if (scanRules.length===0) return;
    setScanRule(scanRule);
  }
  const {t} = useTranslation('common');
  return (
    <SimpleSelect 
      inputId="scanRuleInput"
      label={t('scanRules')}
      defaultValue={curVal} 
      options={
       [{key:t('empty'), val:''}, ...scanRules.map((scanRule) => ({key: scanRule.scanRuleName, val: scanRule.scanRuleName}))]
      }
      onChange={(e)=>{onChangeModel(e.currentTarget.value); setCurVal(e.currentTarget.value);}}
    />
  );
};
export default ScanRuleInput;