import useScanRule from "@/panel/stores/useScanRule";
import detectPageStyle from "@/panel/features/Detect/detectPage.module.css";
import useGlobalVarStore from "@/panel/stores/useGlobalVarStore";
import { Draft, FieldData, ScanRule } from "@/types/scanRule.types";
import FieldScanInput from "./FieldScanInput";
import { MouseEvent, useEffect, useState } from "react";
import MagicIcon from "@/public/Icon/Icon-Magic.svg";
import SaveIcon from "@/public/Icon/Icon-Save.svg";
import ResetIcon from "@/public/Icon/Icon-Reset.svg";
import DelIcon from "@/public/Icon/Icon-Dump.svg";
import { useTranslation } from "react-i18next";
import useInspection from "@/panel/hooks/useInspection";
import Tags from "@/panel/components/Tags/Tags";
import { useShallow } from "zustand/react/shallow";

interface DetectedDraftProps {
  idx: string;
  note: Draft;
  scanRuleId: string;
  checkAdd: (val:boolean)=>void;
};

const DetectedDraft = ({idx, note, scanRuleId, checkAdd}:DetectedDraftProps) => {
  const {removeDraft,updateDraft, drafts} = useScanRule(
    useShallow((state)=>({
      drafts: state.drafts,
      removeDraft: state.removeDraft,
      updateDraft: state.updateDraft
    }))
  );
  const {setCurrentDetected, currentDetected} = useGlobalVarStore();
  const {t} = useTranslation('common');
  const {t:tDraft} = useTranslation('components', {keyPrefix: 'detectedDraft'});
  const [currentDraft, setCurrentDraft] = useState(note);
  const [isEditing, setIsEditing] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const {enterInspectionMode,isInspectionMode} = useInspection();
  const onClick = (e:MouseEvent)=>{
    if (isEditing){
      onReset(e);
    }
    setIsEditing(!isEditing)
  }
  const onReset = (e:MouseEvent)=>{
    e.stopPropagation();
    setCurrentDraft(note);
    setIsChanged(false);
  };
  useEffect(() => {
    setCurrentDraft(note);
  }, [note]);
  return (  
  <article className={`${detectPageStyle.detectedDraftContainer}` + (isEditing? ` ${detectPageStyle.editing}` : '')} 
  onClick={onClick} title={isEditing ? tDraft('clickToStopEditingAndRevert') : tDraft('clickToEdit')}>
    {
      !isEditing ?<input type="checkbox" onChange={e=>{checkAdd(e.target.checked)}} onClick={e=>e.stopPropagation()}/> : null
    }
    <div className={detectPageStyle.detectedDraftContent}>
      <div style={{display: 'flex', gap:'5px'}}>
        <span className={detectPageStyle.scanRuleName} title={t('scanRule')} >{scanRuleId}</span>
        <Tags 
          isModifying={isEditing} 
          givenTagIds={currentDraft.tagIds}
          onAddTag={(newTag)=>{
            setCurrentDraft({...currentDraft,tagIds:[...currentDraft.tagIds, newTag.name]});
            setIsChanged(true);
          }}
          onRemoveTag={(targetTag)=>{
            setCurrentDraft({...currentDraft,tagIds:[...currentDraft.tagIds].filter((tagName)=>tagName!==targetTag.name)});
            setIsChanged(true);
          }}
        />
      </div>
      {
        currentDraft.fields.map((item, idx)=>{
          return <FieldScanInput key={idx} field={item} isEditing={isEditing} setCurrentField={(newField:FieldData)=>{
            const newFields = [...currentDraft.fields,];
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
      <>
        <img title={tDraft('extractData')} src={MagicIcon} onClick={(e)=>{
          e.stopPropagation();
          enterInspectionMode();
        }}/> 
        <img src={SaveIcon} onClick={(e)=>{
          e.stopPropagation();
          updateDraft(idx,
            {
              fields: currentDraft.fields,
              tagIds: currentDraft.tagIds
            }
          );
          setIsEditing(false);
        }}/>
        {isChanged &&
          <img src={ResetIcon} onClick={onReset}/>}
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