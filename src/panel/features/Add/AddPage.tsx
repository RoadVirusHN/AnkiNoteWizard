import AddIcon from "@/public/Icon/Icon-Add.svg";
import CancleIcon from "@/public/Icon/Icon-Reset.svg";
import SaveIcon from "@/public/Icon/Icon-Save.svg";
import addPageStyle from "./addPage.module.css";
import commonStyle from "@/panel/common.module.css";
import InspectionOverlay from "@/panel/components/InspectionOverlay/InspectionOverlay";
import Tags from "@/panel/components/Tags/Tags";
import useAnkiConnectionStore from "@/panel/stores/useAnkiConnectionStore";
import ModelInput from "@/panel/components/Inputs/ModelInput/ModelInput";
import { useEffect, useRef, useState } from "react";
import useGlobalVarStore from "@/panel/stores/useGlobalVarStore";
import ScanRuleInput from "@/panel/components/Inputs/ScanRuleInput/ScanRuleInput";
import DeckInput from "@/panel/components/Inputs/DeckInput/DeckInput";
import Icon from "@/panel/components/Icon/Icon";
import useInspection from "@/panel/hooks/useInspection";
import { NavLink } from "react-router";
import { INSPECTION_MODE } from "@/types/app.types";
import SimpleButton from "@/panel/components/Inputs/SimpleButton/SimpleButton";
import { useTranslation } from "react-i18next";
import { deleteAllMediaTags, processMediaInHtml, removeDeletedMediaTags } from "@/panel/utils/quillUtils";
import useScanRule from "@/panel/stores/useScanRule";
import { isNoteValid } from "@/panel/utils/functions";
import FieldInput, { FieldInputHandle } from "../../components/Inputs/FieldInput/FieldInput";
import EditorToolbar from "@/panel/components/Editor/EditorToolbar";


const AddPage = ({}) => {
  const {fetchAnki, isConnected, decks,models} = useAnkiConnectionStore();
  const {currentAddingDraft, setCurrentAddingDraft, currentDeckId} = useGlobalVarStore();
  const [curNote, setCurNote] = useState({
    ...currentAddingDraft,
    modelId: currentAddingDraft.modelId || (Object.keys(models).length > 0 ? Object.keys(models)[0] : ''),
    deckId: currentAddingDraft.deckId || (Object.keys(decks).length > 0 ? Object.keys(decks)[0] : ''),
  });
  useEffect(()=>{
    setCurNote({
      ...currentAddingDraft,
      modelId: currentAddingDraft.modelId || (Object.keys(models).length > 0 ? Object.keys(models)[0] : ''),
      deckId: currentAddingDraft.deckId || (Object.keys(decks).length > 0 ? Object.keys(decks)[0] : ''),
    });
  },[currentAddingDraft,decks,models]);
  const fieldRefs = useRef<FieldInputHandle[]>([]);
  
  // const reRender = useForceUpdate();S
  const [isChanged, setIsChanged] = useState(false);

  const checkDeckInput = () => {
    let errors = [] as string[];
    if (currentDeckId === null||currentDeckId === ''){
      console.log('No deck selected');
      errors.push(tError('detectPage.selectDeckFirst.statusText'));
    } else if (!isConnected) {
      console.log('Anki is not connected');
      alert(tError('common.ankiNotConnected'));
    } else if (currentDeckId && !decks[currentDeckId]) {
      console.log('Deck not found in Anki');
      errors.push(tError('detectPage.deckNotFoundInAnki.statusText'));
    }

    setErrorMessages({...errorMessages, deck: errors});
    return errors.length > 0;
  }
  const [errorMessages, setErrorMessages] = useState<{[key:string]:string[]}>({
    deck: [],
    model: [],
  });
  const {scanRules} = useScanRule();
  const {t} = useTranslation('page',{keyPrefix: 'addPage'});
  const {t:tCommon} = useTranslation('common');
  const {t:tError} = useTranslation('error');
  const {cancleInspectionMode,isInspectionMode} = useInspection();
  const toolbarRef = useRef<HTMLDivElement>(null);

  return <div className={addPageStyle.container}>
    <div className={addPageStyle.header}>     
      <h2>{t('addNoteToAnki')}</h2>
      <div className={commonStyle.toggle}>
        <div className={addPageStyle.modBtns} style={{visibility: isChanged ? "visible" : "hidden"}}>
          <Icon url={CancleIcon} handleClick={()=>{
            setCurNote(currentAddingDraft);
            currentAddingDraft.fields.forEach((field, idx) => {
                fieldRefs.current[idx]?.reset(field.content);
            });
            setIsChanged(false);
          }} style={{'cursor': 'pointer', margin: '5px'}}/>
          <Icon url={SaveIcon} handleClick={()=>{
            setIsChanged(false);
            const newNote = {
              ...curNote,
              fields: curNote.fields.map((field, idx) => ({
                  ...field,
                  content: fieldRefs.current[idx].getContent()
              }))
            };
        
            setCurNote(newNote);
            setCurrentAddingDraft(newNote);
            fieldRefs.current.forEach(f=>f.saved());
          }} style={{'cursor': 'pointer', margin: '5px'}}/>
        </div>
      </div>
      <NavLink to="/errorTesting/runtime">go to Error page(testing)</NavLink>
    </div>
      {<section className={addPageStyle.content}>
        {isInspectionMode ?? <InspectionOverlay mode={INSPECTION_MODE.TEXT_EXTRACTION} cancleInspectionMode={cancleInspectionMode}/>}
        <div className={addPageStyle.formGroup}>
          <DeckInput label={tCommon('deck')} onChange={(e)=>{
            setCurNote({...curNote, deckId: e.target.value}); 
            checkDeckInput();
            setIsChanged(true);
          }} initDeckId={curNote.deckId}
            errorMessages={errorMessages.deck}/>
        </div>
        <ScanRuleInput defaultScanRule={curNote.scanRuleId? curNote.scanRuleId : ''} setScanRule={(scanRuleName:string)=>{
          const scanRule = scanRules[scanRuleName];
          if (scanRule&& confirm(t('changeScanRuleWarning'))){
            curNote.fields.forEach((field, idx) => {
              if (fieldRefs.current[idx].editorQuill)
                deleteAllMediaTags(fieldRefs.current[idx].editorQuill);
            });
            setCurNote({...curNote, scanRuleId: scanRule.scanRuleName, modelId: scanRule.modelId, fields: Object.keys(scanRule.fields).map((fieldName:string)=>({key: fieldName, content: ''})), tagIds: scanRule.tagIds});
            
          }
          setIsChanged(true);
        }}/>
        <ModelInput defaultModelId={curNote.modelId} setModelId={(newId:string)=>{
          if (confirm(t('changeModelFieldWarning'))){
            curNote.fields.forEach((field, idx) => {
              if (fieldRefs.current[idx].editorQuill)
                deleteAllMediaTags(fieldRefs.current[idx].editorQuill);
            }); 
            setCurNote({...curNote, modelId:newId, fields: models[newId].fields.map((fieldName:string)=>({key: fieldName, content: ''}))});
            setIsChanged(true);
            return true;
          }
          return false;
        }}
          errorMessages={errorMessages.model}
        />
        <div className={addPageStyle.fakeLabel}>{t('tagsLabel')}</div>
        <Tags givenTagIds={curNote.tagIds} isModifying={true} 
        onAddTag={(tag)=>{
          setIsChanged(true);
          setCurNote({...curNote, tagIds: [...curNote.tagIds, tag.name]});
        }} 
        onRemoveTag={(tag)=>{
          setIsChanged(true);
          setCurNote({...curNote, tagIds: curNote.tagIds.filter(t=>t !== tag.name)});
        }}/>
        <div className={addPageStyle.fakeLabel}>{t('fieldsLabel')}</div>
        <EditorToolbar toolbarRef={toolbarRef} show={true}/>
        {
          curNote.fields.map((item, idx)=>{
          return (            
            <FieldInput key={idx}
              field={item}
              editorToolbarRef={toolbarRef}
              options={{
                alwaysToolbar: true,
              }}
              onDirty={()=>{setIsChanged(true);}}
              ref={e=>{if (e) fieldRefs.current[idx]= e;}}/>
            )
          })
        }
      </section> }
      <div style={{height:'45px'}}/> {/* for button space */} 
      <SimpleButton src={AddIcon} 
        className={addPageStyle.addBtn}
        onClick={async ()=>{
          if (checkDeckInput()){
            return;
          }
          const res = isNoteValid(curNote, models[curNote.modelId], tError);
          let newErrorMessages = {model: [], deck: []} as typeof errorMessages;
          if (res.result!== 'ok'){
            for (const code of res.error){
              if(code === 'modelNotFoundError.code'){
              } else if (code === 'emptyModelError.code'){
                newErrorMessages['model'].push(tError('addNote.emptyModelError.statusText'));
              } else if (code === 'emptyDeckError.code'){
                newErrorMessages['deck'].push(tError('addNote.emptyDeckError.statusText'));
              } else if (code === 'fieldModelMismatchError.code'){
                newErrorMessages['model'].push(tError('addNote.fieldModelMismatchError.statusText'));
              } else{
                alert(tCommon('error')+`: ${res.error}`);
              }            
            }
            setErrorMessages(newErrorMessages);
            if (newErrorMessages.model.length>0 || newErrorMessages.deck.length>0){
              alert(tError('addNote.addNoteFail.statusText') + ' ' + newErrorMessages.model.concat(newErrorMessages.deck).join('\n') );
            }
            return;
          }
          const updatedFields = curNote.fields.map((field, idx) => ({
            ...field,
            content: fieldRefs.current[idx].getContent()
          }));
          for (const fieldName in updatedFields){
            let content = updatedFields[fieldName].content;
            let res = await processMediaInHtml(content);
            if (res.result==='error'){
              alert(tError('addNote.addNoteFail.statusText') + ' ' + res.errors);
              return;
            } else if (res.errors.length>0){
              if (!confirm(tError('addNote.confirmAddAnyway')) + ' ' + res.errors.join('\n')){
                return;
              }
            }
            updatedFields[fieldName] = {
              ...updatedFields[fieldName],
              content: res.data
            }
          }

          const req = {
            action: 'addNote',
            params: {
              note: {
                deckName: curNote.deckId,
                modelName: models[curNote.modelId].name,
                fields: updatedFields.reduce((acc, field) => {
                  acc[field.key] = field.content;
                  return acc;
                }, {} as {[key:string]: string}),
                tags: curNote.tagIds,
              } 
            },
          };
          console.log('AddPage: addNote request', req);
          //TODO: Store MediaFile!
          await fetchAnki(req).then((res)=>{
            setIsChanged(false);
            setCurrentAddingDraft(curNote);
            console.log('AddPage: addNote response', res);
            alert(res.error ? tCommon('error')+`: ${res.error}` : t('addNoteSuccess'));
            });
          }}
        text={t('addNote')}
      />
  </div>;
};
export default AddPage;