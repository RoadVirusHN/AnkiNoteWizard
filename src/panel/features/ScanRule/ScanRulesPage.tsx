import Icon from "@/panel/components/Icon/Icon";
import ScanRuleDetail from "@/panel/features/ScanRule/ScanRuleDetail/ScanRuleDetail";
import useScanRule from "@/panel/stores/useScanRule";
import scanRulesStyle from "./scanRules.module.css";
import AddIcon from "@/public/Icon/Icon-Add.svg";
import DumpSvg from "@/public/Icon/Icon-Dump.svg";
import { useState } from "react";
import { useNavigate } from "react-router";
import SimpleButton from "@/panel/components/Inputs/SimpleButton/SimpleButton";

const ScalnRulePage = ({}) => {
  const {scanRules, removeScanRule: removeScanRule} = useScanRule();  
  const navigate = useNavigate();
  const [checkedList, setCheckedList] = useState<string[]>([]);
  return (<div className={scanRulesStyle.container}>
    <Icon url={AddIcon} handleClick={()=>{
      navigate("/scanRules/modify");
    }}
    style={{cursor: "pointer"}}
    title="Add Scan Rule"
    />  
    {Object.values(scanRules).map((scanRule,idx)=>
    <ScanRuleDetail key={scanRule.scanRuleName} idx={idx} scanRule={scanRule} onCheck={(e)=>{
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
            if (confirm(`정말 ${checkedList.length}개의 스캔 규칙을 삭제하시겠습니까?`)){
              for (let scanRuleName of checkedList){
                removeScanRule(scanRuleName);
              }
            }
          }}/>
          <SimpleButton text="Export" onClick={()=>{
            // TODO : Export Functionality
          }}/>
        </>
      }
      <SimpleButton text="Import Scan rules" onClick={()=>{
        // TODO : Import Functionality
      }} />
    </div>
    {/* Spacer for fixed Buttons */}
    <div style={{height: "25px"}}/>
  </div>);
};
export default ScalnRulePage;

        // <img src={DumpSvg} 
        // onClick={()=>{

        // }}/>