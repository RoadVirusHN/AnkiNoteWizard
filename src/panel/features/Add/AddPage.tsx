import PreviewIcon from "@/public/Icon/Icon-Preview.svg";
import DecksIcon from "@/public/Icon/Icon-Decks.svg";
import AddIcon from "@/public/Icon/Icon-Add.svg";
import CancleIcon from "@/public/Icon/Icon-Reset.svg";
import SaveIcon from "@/public/Icon/Icon-Save.svg";
import addPageStyle from "./addPage.module.css";
import commonStyle from "@/panel/common.module.css";
import InspectionOverlay from "@/panel/components/InspectionOverlay/InspectionOverlay";
import Tags from "@/panel/components/Tags/Tags";
import useAnkiConnectionStore from "@/panel/stores/useAnkiConnectionStore";
import ModelInput from "@/panel/components/Inputs/ModelInput/ModelInput";
import { useState } from "react";
import useGlobalVarStore from "@/panel/stores/useGlobalVarStore";
import ScanRuleInput from "@/panel/components/Inputs/ScanRuleInput/ScanRuleInput";
import DeckInput from "@/panel/components/Inputs/DeckInput/DeckInput";
import Icon from "@/panel/components/Icon/Icon";
import useInspection from "@/panel/hooks/useInspection";
import MagicIcon from "@/public/Icon/Icon-Magic.svg";
import { NavLink } from "react-router";
import { INSPECTION_MODE } from "@/types/app.types";
import SimpleButton from "@/panel/components/Inputs/SimpleButton/SimpleButton";
import { useTranslation } from "react-i18next";
import { isNoteValid } from "@/panel/utils/functions";
import FieldInput from "@/panel/components/Inputs/FieldInput/FieldInput";
import useScanRule from "@/panel/stores/useScanRule";
import { Model } from "@/types/scanRule.types";

const AddPage = ({}) => {
  const {fetchAnki} = useAnkiConnectionStore();
  const {currentAddingDraft: currentAddingNote, setCurrentAddingDraft: setCurrentAddingNote} = useGlobalVarStore();
  const {scanRules} = useScanRule();
  const [curNote, setCurNote] = useState(currentAddingNote);
  const [isChanged, setIsChanged] = useState(false);
  const [isModifying, setIsModifying] = useState(true);
  const [errorMessages, setErrorMessages] = useState<{[key:string]:string[]}>({
    deck: [],
    model: [],
  });
  const {models} = useAnkiConnectionStore();  
  const {t} = useTranslation('page',{keyPrefix: 'addPage'});
  const {t:tCommon} = useTranslation('common');
  const {t:tError} = useTranslation('error',{keyPrefix: 'addNote'});
  const {cancleInspectionMode,isInspectionMode} = useInspection();
  
  const setField = (fieldKey:string, content:string) => {
    const newFields = curNote.fields.map(field=>{
      if (field.key === fieldKey){
        return {...field, content};
      }
      return field;
    });
    setCurNote({...curNote, fields: newFields});
    setIsChanged(true);
  };
  return <div className={addPageStyle.container}>
    <div className={addPageStyle.header}>     
      <h2>{t('addNoteToAnki')}</h2>
      <div className={commonStyle.toggle}>
        <div className={addPageStyle.modBtns} style={{visibility: isChanged ? "visible" : "hidden"}}>
          <Icon url={CancleIcon} handleClick={()=>{
            setIsChanged(false);
            setCurNote(currentAddingNote);
          }} style={{'cursor': 'pointer', margin: '5px'}}/>
          <Icon url={SaveIcon} handleClick={()=>{
            setIsChanged(false);
            setCurrentAddingNote(curNote);
          }} style={{'cursor': 'pointer', margin: '5px'}}/>
        </div>
      </div>
      <NavLink to="/errorTesting/runtime">go to Error page(testing)</NavLink>
    </div>
      {<section className={addPageStyle.content}>
        {isInspectionMode ?? <InspectionOverlay mode={INSPECTION_MODE.TEXT_EXTRACTION} cancleInspectionMode={cancleInspectionMode}/>}
        <div className={addPageStyle.formGroup}>
          <DeckInput label={tCommon('deck')} onChange={(e)=>{setCurNote({...curNote, deckId: e.target.value}); setIsChanged(true);}} initDeckId={curNote.deckId}
            errorMessages={errorMessages.deck}/>
        </div>
        <ScanRuleInput defaultScanRule={curNote.scanRuleId? curNote.scanRuleId : ''} setScanRule={(scanRuleName:string)=>{
          setCurNote({...curNote, scanRuleId: scanRuleName});
          setIsChanged(true);
        }}/>
        <ModelInput defaultModelId={curNote.modelId} setModelId={(id:string)=>{
          if (confirm(t('changeModelFieldWarning'))){ 
            setCurNote({...curNote, modelId:id, fields: models[id].fields.map((fieldName:string)=>({key: fieldName, content: ''}))});
            setIsChanged(true);
          }
        }}
          errorMessages={errorMessages.model}
        />
        <div className={addPageStyle.fakeLabel}>{t('tagsLabel')}</div>
        <Tags givenTagIds={curNote.tagIds} isModifying={isModifying} 
        onAddTag={(tag)=>{
          setIsChanged(true);
          setCurNote({...curNote, tagIds: [...curNote.tagIds, tag.name]});
        }} 
        onRemoveTag={(tag)=>{
          setIsChanged(true);
          setCurNote({...curNote, tagIds: curNote.tagIds.filter(t=>t !== tag.name)});
        }}/>
        <div className={addPageStyle.fakeLabel}>{t('fieldsLabel')}</div>
        {
          curNote.fields.map((item, idx)=>{
          return (            
            <FieldInput key={idx} field={item} onChange={(e)=>{
              const newFields = [...curNote.fields];
              newFields[idx] = {...newFields[idx], content: e.target.value};
              setCurNote({...curNote, fields: newFields});
              setIsChanged(true);
              console.log(e.target.value);
            }}/>)
          })
        }
      </section> }
      <div style={{height:'45px'}}/> {/* for button space */} 
      <SimpleButton src={AddIcon} 
        className={addPageStyle.addBtn}
        onClick={async ()=>{
          const res = isNoteValid(curNote, models[curNote.modelId], tError);
          console.log(res);
          if (res.result!== 'success'){
            for (const code of res.error){
              if(code === 'modelNotFoundError.code'){
                setErrorMessages({...errorMessages, model: [...errorMessages.model, tError('modelNotFoundError.statusText')]});
              } else if (code === 'emptyModelError.code'){
                setErrorMessages({...errorMessages, model: [...errorMessages.model, tError('emptyModelError.statusText')]});
              } else if (code === 'emptyDeckError.code'){
                setErrorMessages({...errorMessages, deck: [...errorMessages.deck, tError('emptyDeckError.statusText')]});
              } else if (code === 'fieldModelMismatchError.code'){
                setErrorMessages({...errorMessages, model: [...errorMessages.model, tError('fieldModelMismatchError.statusText')]});
              } else{
                alert(tCommon('error')+`: ${res.error}`);
              }            
            }

            return;
          }
          const req = {
            action: 'addNote',
            params: {
              note: curNote
            },
          };
          //TODO : AnkiConnect Media Actions 연구 및 적용. 현재는 media 필드도 그냥 note의 field로 보내고 있음.
          await fetchAnki(req).then((res)=>{
            setIsChanged(false);
            setCurNote(currentAddingNote);
            alert(res.error ? tCommon('error')+`: ${res.error}` : t('addNoteSuccess'));
            });
          }}
        text={t('addNote')}
      />
  </div>;
};
export default AddPage;