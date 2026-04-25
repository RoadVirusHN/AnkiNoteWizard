import useScanRule from "@/panel/stores/useScanRule";
import scanRuleDetailStyle from "./scanRuleDetail.module.css";
import ModifySvg from "@/public/Icon/Icon-Modify.svg";
import DumpSvg from "@/public/Icon/Icon-Dump.svg";
import { useNavigate } from "react-router";
import { ScanRule } from "@/types/scanRule.types";
const ScanRuleDetail = ({scanRule, idx}:{scanRule: ScanRule, idx: number}) => {
  const {removeScanRule: removeScanRule} = useScanRule();
  const navigate = useNavigate();
  
  return (<div className={scanRuleDetailStyle.scanRule}>
    <h2>{scanRule.scanRuleName}</h2>
    {scanRule.meta.description}
    {scanRule.tags}
    <img src={DumpSvg} 
    onClick={()=>{
      if (confirm(`정말 "${scanRule.scanRuleName}" 카드를 삭제하시겠습니까?`)){
        removeScanRule(scanRule.scanRuleName);
      }
    }}/>
    <img src={ModifySvg} onClick={()=>{
      navigate(`/scanRules/modify/${idx}`);
    }}/>
  </div>);
};
export default ScanRuleDetail;