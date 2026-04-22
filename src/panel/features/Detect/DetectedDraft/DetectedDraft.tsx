import useScanRule from "@/panel/stores/useScanRule";
import detectPageStyle from "@/panel/features/Detect/detectPage.module.css";
import commonStyle from "@/panel/common.module.css";

import DelIcon from "@/public/Icon/Icon-Dump.svg";
import { useNavigate } from "react-router";
import { getComplementaryColor } from "@/panel/utils/functions";
import useGlobalVarStore from "@/panel/stores/useGlobalVarStore";
import Tags from "@/panel/components/Tags/Tags";
import { Extracted, ScanRule } from "@/types/scanRule.types";


interface DetectedDraftProps {
  idx: string;
  extracted: Extracted;
  scanRule: ScanRule;
  checkAdd: (val:boolean)=>void;
};

const DetectedDraft = ({idx, extracted, scanRule, checkAdd}:DetectedDraftProps) => {
   const navigate = useNavigate();
   const {notes, removeNote} = useScanRule();
   const {setCurrentDetected, currentDetected} = useGlobalVarStore();
   return (  
    <article className={detectPageStyle.detectedCardContainer} onClick={()=>{navigate(`/previewCard/${idx}`)}}>
      <input type="checkbox" onChange={e=>{checkAdd(e.target.checked)}} onClick={e=>e.stopPropagation()}/>
      <div className={detectPageStyle.detectedCardContent}>
        <div style={{display: 'flex'}}>
          <span className={detectPageStyle.scanRuleName} >{scanRule.scanRuleName}</span>
        </div>
        {/* TODO : change Front value when card front html value changed? */}
        {/* TODO : Modifyied! flag when modifyied */}
        <h3 className={detectPageStyle.front}>{extracted.Front['front']}</h3> 
        <p className={detectPageStyle.back}>{extracted.Back['back']}</p>
      </div>
      {/* TODO : Add Del function - make Hash of card and ban it. */}
      <div className={detectPageStyle.delButton}>
        <img src={DelIcon} onClick={(e)=>{
          e.stopPropagation();
          removeNote(idx);
          setCurrentDetected(currentDetected - 1); // TODO : make change when notes changed.
        }} style={{cursor: 'pointer'}}/>
      </div>
    </article>);
};
export default DetectedDraft;