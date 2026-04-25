import Icon from "@/panel/components/Icon/Icon";
import ScanRuleDetail from "@/panel/features/ScanRule/ScanRuleDetail/ScanRuleDetail";
import useScanRule from "@/panel/stores/useScanRule";
import AddIcon from "@/public/Icon/Icon-Add.svg";
import { useNavigate } from "react-router";

const ScalnRulePage = ({}) => {
  const {scanRules} = useScanRule();  
  const navigate = useNavigate();
  return (<div>
    <Icon url={AddIcon} handleClick={()=>{
      navigate("/scanRules/modify");
    }}
    style={{cursor: "pointer"}}/>  
    {scanRules.map((scanRule,idx)=>
    <ScanRuleDetail key={scanRule.scanRuleName} idx={idx} scanRule={scanRule} />)}
  </div>);
};
export default ScalnRulePage;