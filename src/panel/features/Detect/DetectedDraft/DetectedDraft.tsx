import useScanRule from "@/panel/stores/useScanRule";
import detectedDraftStyles from "@/panel/features/Detect/DetectedDraft/detectedDraft.module.css";
import useGlobalVarStore from "@/panel/stores/useGlobalVarStore";
import { Draft, FieldData, ScanRule } from "@/types/scanRule.types";
import FieldScanInput, { FieldScanInputHandle } from "./FieldScanInput";
import { MouseEvent, useEffect, useRef, useState } from "react";
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
  isChecked: boolean;
};

const DetectedDraft = ({idx, note, scanRuleId, checkAdd, isChecked}:DetectedDraftProps) => {
  const {removeDraft,updateDraft, drafts} = useScanRule(
    useShallow((state)=>({
      drafts: state.drafts,
      removeDraft: state.removeDraft,
      updateDraft: state.updateDraft
    }))
  );
  const {t} = useTranslation('common');
  const {t:tDraft} = useTranslation('components', {keyPrefix: 'detectedDraft'});
  const [currentDraft, setCurrentDraft] = useState(note);
  const fieldRefs = useRef<FieldScanInputHandle[]>([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const {enterInspectionMode,isInspectionMode} = useInspection();
  const checkRef = useRef<HTMLInputElement>(null);
  if (checkRef.current){
    checkRef.current.checked = isChecked;
  }
  const onClickDraft = (e:MouseEvent)=>{
    if (isEditing){
      onReset(e);
    }
    setIsEditing(!isEditing)
  }
  const onReset = (e:MouseEvent)=>{
    e.stopPropagation();
    setCurrentDraft(note);
    currentDraft.fields.forEach((field, idx)=>{
      fieldRefs.current[idx]?.reset(field.content);
    });
    setIsChanged(false);
  };
  useEffect(() => {
    setCurrentDraft(note);
  }, [note]);
  return (  
  <article className={`${detectedDraftStyles.detectedDraftContainer}` + (isEditing? ` ${detectedDraftStyles.editing}` : '')} 
  onClick={onClickDraft} title={isEditing ? tDraft('clickToStopEditingAndRevert') : tDraft('clickToEdit')}>
    <div className={detectedDraftStyles.detectedDraftContent}>
      <div className={detectedDraftStyles.detectedDraftHeader}>
        <div className={detectedDraftStyles.scanRuleNameContainer}>
          <input ref={checkRef} type="checkbox" className={detectedDraftStyles.checkBox} onChange={e=>{checkAdd(e.target.checked)}} onClick={e=>e.stopPropagation()}/>
          <span className={detectedDraftStyles.scanRuleName} title={t('scanRule')} >{scanRuleId}</span>
          <div className={detectedDraftStyles.tagTrap} style={{pointerEvents: isEditing ? 'auto' : 'none'}}>
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
              }}/>
          </div>
        </div>
        <div className={detectedDraftStyles.buttons}>
        {
          isEditing ? 
          <>
            <img title={tDraft('extractData')} src={MagicIcon} onClick={(e)=>{
              e.stopPropagation();
              enterInspectionMode();
            }}/> 
            {isChanged && <img src={SaveIcon} onClick={(e)=>{
              e.stopPropagation();
              updateDraft(idx,
                {
                  fields: currentDraft.fields.map((field, idx)=> ({
                    ...field,
                    content: fieldRefs.current[idx].getContent()
                  })),
                  tagIds: currentDraft.tagIds
                }
              );
              setIsChanged(false);
            }}/>}
            {isChanged &&
              <img src={ResetIcon} onClick={onReset}/>}
            </> :
          <img src={DelIcon} onClick={(e)=>{
            e.stopPropagation();
            removeDraft(idx);
          }} />
        }
        </div>
      </div>
      <div className={detectedDraftStyles.fieldList} style={{maxHeight:isEditing ? 'fit-content' : '250px'}}> 
        {
          currentDraft.fields.map((item, idx)=>{
            return <FieldScanInput key={idx} field={item} 
            isEditing={isEditing} 
            defaultFocus={idx===0} 
            onDirty={()=>{setIsChanged(true);}}
            ref={e=>{if (e) fieldRefs.current[idx]=e;}}
            />
          })
        }
      </div>
    </div>
  </article>);
};
export default DetectedDraft;