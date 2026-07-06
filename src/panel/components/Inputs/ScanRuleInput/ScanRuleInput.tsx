import { useState } from "react";
import useScanRule from "@/panel/stores/useScanRule";
import SimpleSelect from "../SimpleSelect/SimpleSelect";
import { useTranslation } from "react-i18next";

const ScanRuleInput = ({setScanRule, defaultScanRule}:{setScanRule: (model:string)=>void, defaultScanRule: string}) => {
  const [curVal, setCurVal] = useState(defaultScanRule || 'Empty'); 
  const {scanRules} = useScanRule();
  const onChangeModel = (scanRule:string) => {
    if (Object.keys(scanRules).length===0) return;
    setScanRule(scanRule);
  }
  const {t} = useTranslation('common');
  return (
    <SimpleSelect 
      inputId="scanRuleInput"
      label={t('scanRule')}
      defaultValue={curVal} 
      options={
       [{key:t('empty'), val:''}, ...Object.values(scanRules).map((scanRule) => ({key: scanRule.scanRuleName, val: scanRule.scanRuleName}))]
      }
      onChange={(e)=>{onChangeModel(e.currentTarget.value); setCurVal(e.currentTarget.value);}}
    />
  );
};
export default ScanRuleInput;