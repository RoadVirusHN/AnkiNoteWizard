import ReturnIcon from "@/public/Icon/Icon-Return.svg";
import PreviewIcon from "@/public/Icon/Icon-Preview.svg";
import CancleIcon from "@/public/Icon/Icon-Reset.svg";
import SaveIcon from "@/public/Icon/Icon-Save.svg";
import CodeIcon from "@/public/Icon/Icon-Code.svg";
import previewCardStyle from "../previewCard.module.css";
import commonStyle from "@/panel/common.module.css";
import { useNavigate } from "react-router";
import { useContext, useState } from "react";
import useScanRule from "@/panel/stores/useScanRule";
import { PreviewContext } from "../PreviewContext";
const PreviewHeader = () => {
  const {contextValue, setContextValue} = useContext(PreviewContext);
  const {notes, scanRules: scanRules, updateNote} = useScanRule();
  const {curNote, isModifying, isChanged, idx} = contextValue; 
  const scanRuleIdx = Number(idx.split('-')[0]);
  const navigate = useNavigate();
  return (<div className={previewCardStyle.header}>
    <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
      <img src={ReturnIcon} onClick={()=>{navigate('/')}} style={{'cursor': 'pointer'}}/> 
      <h2>{scanRules[scanRuleIdx].scanRuleName}</h2>
    </div>
    <div className={commonStyle.toggle}>
      <div className={previewCardStyle.modBtns} style={{visibility: isChanged ? "visible" : "hidden"}}>
        <img src={CancleIcon}  onClick={()=>{
          setContextValue({...contextValue, curNote: notes[idx],isChanged:false});
          }} style={{'cursor': 'pointer', margin:'5px'}}/>
        <img src={SaveIcon}  onClick={()=>{
          updateNote(idx,{...curNote});
          setContextValue({...contextValue,isChanged:false});
          }} style={{'cursor': 'pointer', margin: '5px'}}/>
      </div>
      <img src={PreviewIcon} />
      <label className={commonStyle.switch}>
        <input type="checkbox" onChange={(e)=>{
          setContextValue({...contextValue,isModifying:e.target.checked});
        }}/>
        <span className={commonStyle.slider} title={isModifying ? "Modify" : "Preview"}/>
      </label>
      <img src={CodeIcon} />
    </div>
  </div>);
};
export default PreviewHeader;