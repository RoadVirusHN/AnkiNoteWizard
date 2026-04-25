import { useState } from "react";
import useScanRule from "@/panel/stores/useScanRule";
import { useTranslation } from "react-i18next";
const ScanRuleInput = ({setScanRule, defaultScanRule}:{setScanRule: (model:string)=>void, defaultScanRule: string}) => {
  const {scanRules: scanRules} = useScanRule();
  const [curVal, setCurVal] = useState(defaultScanRule || 'Empty'); 
  const onChangeModel = (scanRule:string) => {
    if (scanRules.length===0) return;
    setScanRule(scanRule);
  }
  const [t] = useTranslation();
  return (
    <div>
      <label htmlFor="scan-rule-select">
        {t('common.scanRules')}
      </label>
      <select id="scan-rule-select" name="scan-rule-select" style={{height: '20px', width: '180px'}} onChange={(e)=>{
        onChangeModel(e.currentTarget.value); 
        setCurVal(e.currentTarget.value);
      }} value={curVal}>
        <option value=''>{t('common.empty')}</option>          
        {scanRules.map((scanRule) => <option key={scanRule.scanRuleName} value={scanRule.scanRuleName}>{scanRule.scanRuleName}</option>)}
      </select>
    </div>
  );
};
export default ScanRuleInput;