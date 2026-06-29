import useScanRule from "@/panel/stores/useScanRule";
import detectPageStyle from "@/panel/features/Detect/detectPage.module.css";
import useGlobalVarStore from "@/panel/stores/useGlobalVarStore";
import { Draft, FieldData, ScanRule } from "@/types/scanRule.types";
import FieldInput from "./FieldInput";
import React, { MouseEvent, useState } from "react";

import SaveIcon from "@/public/Icon/Icon-Save.svg";
import ResetIcon from "@/public/Icon/Icon-Reset.svg";
import DelIcon from "@/public/Icon/Icon-Dump.svg";

interface DetectedDraftProps {
  idx: string;
  note: Draft;
  scanRuleId: string;
  checkAdd: (val:boolean)=>void;
};

const DetectedDraft = ({idx, note, scanRuleId, checkAdd}:DetectedDraftProps) => {
  const {removeDraft,updateDraft, drafts, setDrafts} = useScanRule();
  const {setCurrentDetected, currentDetected} = useGlobalVarStore();
  const [currentDraft, setCurrentDraft] = useState(note);
  const [isEditing, setIsEditing] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const onClick = (e:MouseEvent)=>{
    setIsEditing(!isEditing)
    if (!isEditing){
      onReset(e);
    }
  }
  const onReset = (e:MouseEvent)=>{
    e.stopPropagation();
    setCurrentDraft(note);
    setIsChanged(false);
  };

  return (  
  // TODO
  // 1. 클릭으로 초안 모드 변경(전체 화면<->카드)
  //  - 클릭 이전 : 초안의 최초 필드 2개의 Text Content, 스캔 룰 이름, 마우스 호버 시 웹 페이지에서 해당 정보가 어디서 추출되었는지 Highlight, 삭제, 추가, 체크박스
  //  - 클릭 이후 : 카드의 모든 필드의 정보(Scrollable), 스캔 룰 이름, 필드별 텍스트 편집 기능(Text Editor로 전환), 기본 Highlight 필드 위에 마우스 호버 시 웹 페이지에서 해당 필드가 어디서 추출되었는지 Highlight
  <article className={`${detectPageStyle.detectedDraftContainer}` + ` ${detectPageStyle.editing}`} onClick={onClick}>
    {
      !isEditing ?<input type="checkbox" onChange={e=>{checkAdd(e.target.checked)}} onClick={e=>e.stopPropagation()}/> : null
    }
    <div className={detectPageStyle.detectedDraftContent}>
      <div style={{display: 'flex'}}>
        <span className={detectPageStyle.scanRuleName} >{scanRuleId}</span>
      </div>
      {
        note.fields.map((item, idx)=>{
          return <FieldInput key={idx} field={item} isEditing={isEditing} setCurrentField={(newField:FieldData)=>{
            const newFields = [...currentDraft.fields];
            newFields[idx] = newField;
            setCurrentDraft({...currentDraft, fields: newFields});
            setIsChanged(true);
          }}/>
        })
      }
    </div>
    <div className={detectPageStyle.button}>
    {
      isEditing ? 
        <><img src={SaveIcon} onClick={(e)=>{
          e.stopPropagation();
          const newDrafts = {...drafts};
          newDrafts[note.draftId] = {...note,
            fields: currentDraft.fields
          };
          setDrafts(newDrafts);
          setIsEditing(false);
        }} style={{cursor: 'pointer'}}/>
        {isChanged &&
          <img src={ResetIcon} onClick={onReset} style={{cursor: 'pointer'}}/>}
        </> :
      <img src={DelIcon} onClick={(e)=>{
        e.stopPropagation();
        removeDraft(idx);
        setCurrentDetected(currentDetected - 1);
      }} style={{cursor: 'pointer'}}/>
    }
    </div>
  </article>);
};
export default DetectedDraft;