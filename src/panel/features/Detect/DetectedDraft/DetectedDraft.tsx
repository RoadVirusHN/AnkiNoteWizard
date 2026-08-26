import useScanRule from "@/panel/stores/useScanRule";
import detectedDraftStyles from "@/panel/features/Detect/DetectedDraft/detectedDraft.module.css";
import { Draft } from "@/types/scanRule.types";
import FieldInput, { FieldInputHandle } from "./FieldInput";
import { MouseEvent, useEffect, useRef, useState } from "react";
import MagicIcon from "@/public/Icon/Icon-Magic.svg";
import SaveIcon from "@/public/Icon/Icon-Save.svg";
import ResetIcon from "@/public/Icon/Icon-Reset.svg";
import DelIcon from "@/public/Icon/Icon-Dump.svg";
import ErrorIcon from "@/public/Icon/Icon_Error.svg";
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
  errors: string[];
};

const DetectedDraft = ({idx, note, scanRuleId, checkAdd, isChecked, errors}:DetectedDraftProps) => {
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
  const fieldRefs = useRef<FieldInputHandle[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [currentErrors, setCurrentErrors] = useState(errors);
  const {enterInspectionMode,isInspectionMode} = useInspection();
  const checkRef = useRef<HTMLInputElement>(null);
  if (checkRef.current){
    checkRef.current.checked = isChecked;
  }
  const onClickDraft = (e:MouseEvent)=>{
    if (isEditing) onReset(e);    
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
  const onSave = (e:MouseEvent)=>{
    e.stopPropagation();
    fieldRefs.current.forEach((fieldRef)=>{
      fieldRef.saved();
    });
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
    setCurrentErrors([]);
  };
  useEffect(() => {
    setCurrentDraft(note);
  }, [note]);
  return (  
  <article className={`${detectedDraftStyles.detectedDraftContainer}` + (isEditing? ` ${detectedDraftStyles.editing}` : '')} 
  onClick={onClickDraft} title={isEditing ? tDraft('clickToStopEditingAndRevert') : tDraft('clickToEdit')} 
  onDragEnter={(e)=>{
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  }}
  >
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
        {currentErrors&&currentErrors.length> 0 && <img title={currentErrors.join('\n')} src={ErrorIcon}/>}
        {
          isEditing ? 
          <>
            <img className={detectedDraftStyles.nonClickable} title={tDraft('extractData')} src={MagicIcon} onClick={(e)=>{
              e.stopPropagation();
              enterInspectionMode();
            }}/> 
            {isChanged && <img src={SaveIcon} onClick={onSave}/>}
            {isChanged &&
              <img className={detectedDraftStyles.nonClickable} src={ResetIcon} onClick={onReset}/>}
            </> :
          <img className={detectedDraftStyles.nonClickable} src={DelIcon} onClick={(e)=>{
            e.stopPropagation();
            fieldRefs.current.forEach((fieldRef)=>{
              fieldRef.deleted();
            });
            removeDraft(idx);
          }} />
        }
        </div>
      </div>
      <div className={detectedDraftStyles.fieldList} style={{maxHeight:isEditing ? 'fit-content' : '250px'}}> 
        {
          currentDraft.fields.map((item, idx)=>{
            return <FieldInput key={idx} field={item} 
            options={{isEditing:isEditing, defaultFocus: idx===0}}
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