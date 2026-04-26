import useScanRule from "@/panel/stores/useScanRule";
import detectPageStyle from "@/panel/features/Detect/detectPage.module.css";

import DelIcon from "@/public/Icon/Icon-Dump.svg";
import { useNavigate } from "react-router";
import useGlobalVarStore from "@/panel/stores/useGlobalVarStore";
import { Note, ScanRule } from "@/types/scanRule.types";


interface DetectedDraftProps {
  key: string;
  note: Note;
  scanRuleName: String;
  checkAdd: (val:boolean)=>void;
};

const DetectedDraft = ({key, note, scanRuleName, checkAdd}:DetectedDraftProps) => {
   const navigate = useNavigate();
   const {notes, removeNote} = useScanRule();
   const {setCurrentDetected, currentDetected} = useGlobalVarStore();
   return (  
    <article className={detectPageStyle.detectedCardContainer} onClick={()=>{navigate(`/previewCard/${key}`)}}>
      <input type="checkbox" onChange={e=>{checkAdd(e.target.checked)}} onClick={e=>e.stopPropagation()}/>
      <div className={detectPageStyle.detectedCardContent}>
        <div style={{display: 'flex'}}>
          <span className={detectPageStyle.scanRuleName} >{scanRuleName}</span>
        </div>
        {
          Object.keys(note.fields).map((fieldName)=>{
            return <p className={detectPageStyle.back}>{note.fields[fieldName].value}</p>
          })
        }
      </div>
      {/* TODO : Add Del function - make Hash of card and ban it. */}
      <div className={detectPageStyle.delButton}>
        <img src={DelIcon} onClick={(e)=>{
          e.stopPropagation();
          removeNote(key);
          setCurrentDetected(currentDetected - 1); // TODO : make change when notes changed.
        }} style={{cursor: 'pointer'}}/>
      </div>
    </article>);
};
export default DetectedDraft;