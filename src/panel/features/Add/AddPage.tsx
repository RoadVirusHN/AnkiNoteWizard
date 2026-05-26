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

const AddPage = ({}) => {
  const {fetchAnki} = useAnkiConnectionStore();
  const {currentAddingNote, setCurrentAddingNote} = useGlobalVarStore();
  const [curNote, setCurNote] = useState(currentAddingNote);
  const [isChanged, setIsChanged] = useState(false);
  const [isModifying, setIsModifying] = useState(true);
  
  const {models} = useAnkiConnectionStore();  
  const {t} = useTranslation('page',{keyPrefix: 'addPage'});
  const {t:tCommon} = useTranslation('common');
  const {enterInspectionMode,cancleInspectionMode,isInspectionMode} = useInspection();
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
          <DeckInput label={tCommon('deck')} onChange={(deck:string)=>{setCurNote({...curNote, deckName: deck})}}/>
        </div>
        <ScanRuleInput defaultScanRule={curNote.scanRuleName} setScanRule={(scanRule:string)=>{
          setCurNote({...curNote, scanRuleName: scanRule});
          setIsChanged(true);
        }}/>
        <ModelInput defaultModelId={curNote.modelId} setModelId={(modelId:string)=>{
          if (confirm(t('changeModelFieldWarning'))){ 
            setCurNote({...curNote, modelId, fields: models[modelId].fields.map((fieldName:string)=>({key: fieldName, content: ''}))});
            setIsChanged(true);
          }
        }}/>
        <Tags givenTags={curNote.tags} isModifying={isModifying} 
        onAddTag={(tag)=>{
          setIsChanged(true);
          setCurNote({...curNote, tags: [...curNote.tags, tag]});
        }} 
        onRemoveTag={(tag)=>{
          setIsChanged(true);
          setCurNote({...curNote, tags: curNote.tags.filter(t=>t!==tag)});
        }}/>
        {
          curNote.fields.map((item, idx)=>{
            const fieldName = item.key;
            const content = item.content;
          return (            
          <div key={item.key} className={addPageStyle.fieldRow}>
              {/* Field Name */}
              <div>
                <div className={addPageStyle.fieldName}>{fieldName}</div>
              </div>
              
              <div className={addPageStyle.fieldContentWrapper}>
                <input
                  className={`${addPageStyle.input} ${addPageStyle.fieldContent}`}
                  placeholder={t("fieldContentPlaceholder")}
                  value={content}
                  onChange={(e) => {
                    const newFields = [...curNote.fields];
                    newFields[idx] = {...newFields[idx], content: e.target.value};
                    setCurNote({...curNote, fields: newFields});
                    setIsChanged(true);
                  }}
                />
                <SimpleButton title="Extract Data" src={MagicIcon} onClick={()=>{
                  enterInspectionMode();
                  }}/> 
              </div>
            </div>)
          })
        }
      </section> }
      <div style={{height:'45px'}}/> {/* for button space */} 
      <SimpleButton src={AddIcon} 
        className={addPageStyle.addBtn}
        onClick={()=>{
          const res = isNoteValid(curNote, models[curNote.modelId]);
          if (res.result!== 'success'){
            alert(tCommon('error')+`: ${res.error}`);
            return;
          }
          const req = {
            action: 'addNote',
            params: {
              note: curNote
            },
          };
          //TODO : AnkiConnect Media Actions 연구 및 적용. 현재는 media 필드도 그냥 note의 field로 보내고 있음.
          fetchAnki(req).then((res)=>{
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