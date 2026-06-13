import useScanRule from "@/panel/stores/useScanRule";
import detectPageStyle from "@/panel/features/Detect/detectPage.module.css";

import DelIcon from "@/public/Icon/Icon-Dump.svg";
import { useNavigate } from "react-router";
import useGlobalVarStore from "@/panel/stores/useGlobalVarStore";
import { Draft, ScanRule } from "@/types/scanRule.types";
import useConfigure from "@/panel/stores/useConfigure";
import FieldInput from "./FieldInput";


interface DetectedDraftProps {
  key: string;
  note: Draft;
  scanRuleId: string;
  checkAdd: (val:boolean)=>void;
};

const DetectedDraft = ({key, note, scanRuleId: scanRuleId, checkAdd}:DetectedDraftProps) => {
   const navigate = useNavigate();
   const {removeDraft,updateDraft} = useScanRule();
   const {setCurrentDetected, currentDetected} = useGlobalVarStore();
   const {themeOption} = useConfigure();
   return (  
    // TODO
    // 1. 클릭으로 초안 모드 변경(전체 화면<->카드)
    //  - 클릭 이전 : 초안의 최초 필드 2개의 Text Content, 스캔 룰 이름, 마우스 호버 시 웹 페이지에서 해당 정보가 어디서 추출되었는지 Highlight, 삭제, 추가, 체크박스
    //  - 클릭 이후 : 카드의 모든 필드의 정보(Scrollable), 스캔 룰 이름, 필드별 텍스트 편집 기능(Text Editor로 전환), 기본 Highlight 필드 위에 마우스 호버 시 웹 페이지에서 해당 필드가 어디서 추출되었는지 Highlight

    <article className={detectPageStyle.detectedDraftContainer} onClick={()=>{navigate(`/previewCard/${key}`)}}>
      <input type="checkbox" onChange={e=>{checkAdd(e.target.checked)}} onClick={e=>e.stopPropagation()}/>
      <div className={detectPageStyle.detectedDraftContent}>
        <div style={{display: 'flex'}}>
          <span className={detectPageStyle.scanRuleName} >{scanRuleId}</span>
        </div>
        {
          note.fields.map((item)=>{
            return <FieldInput field={item}/>
          })
        }
      </div>
      <div className={detectPageStyle.delButton}>
        <img src={DelIcon} onClick={(e)=>{
          e.stopPropagation();
          removeDraft(key);
          setCurrentDetected(currentDetected - 1);
        }} style={{cursor: 'pointer'}}/>
      </div>
    </article>);
};
export default DetectedDraft;