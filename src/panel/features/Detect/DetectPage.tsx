import detectPageStyle from '@/panel/features/Detect/detectPage.module.css';
import { useEffect, useState } from 'react';
import DetectedDraft from './DetectedDraft/DetectedDraft';
import DeckInput from '@/panel/components/Inputs/DeckInput/DeckInput';

import CheckIcon from "@/public/Icon/Icon-Check.svg";
import UncheckIcon from "@/public/Icon/Icon-Uncheck.svg";
import AddIcon from "@/public/Icon/Icon-Add.svg";
import DeckIcon from '@/public/Icon/Icon-Decks.svg';
import DelIcon from "@/public/Icon/Icon-Dump.svg";

import Icon from '@/panel/components/Icon/Icon';
import useAnkiConnectionStore from '@/panel/stores/useAnkiConnectionStore';
import useGlobalVarStore from '@/panel/stores/useGlobalVarStore';
import useScanRule from '@/panel/stores/useScanRule';
import { ExtractedFields, ExtractedInfos,  FIELD_DATA_TYPES,  Draft, ScanRule } from '@/types/scanRule.types';
import { MESSAGE_TYPE, Response } from '@/types/chrome.types';
import SimpleButton from '@/panel/components/Inputs/SimpleButton/SimpleButton';
import { useTranslation } from 'react-i18next';
import { processMediaInHtml } from '@/panel/utils/functions';
import InspectionOverlay from '@/panel/components/InspectionOverlay/InspectionOverlay';
import { INSPECTION_MODE } from '@/types/app.types';
import useInspection from '@/panel/hooks/useInspection';
import { useShallow } from 'zustand/react/shallow';

//TODO : Apply SCSS for css.

// REQUEST_DETECTED_DRAFTS : content script 에게 현재 페이지에서 추출된 카드 데이터를 요청
// - scanrules : 사용자가 정의한 카드 스캔 규칙들
// SEND_DETECTED_DRAFTS : content script에서 감지된 카드 데이터를 CardPage로 전송
// - extracteds : 감지된 카드 데이터 배열, url : 현재 페이지 URL
const DetectPage: React.FC = () => {
  const {fetchAnki, models, isConnected} = useAnkiConnectionStore();
  const {currentDeckId, setCurrentDeckId} = useGlobalVarStore();
  const {drafts,scanRules, setDrafts} = useScanRule(
    useShallow((state)=>({
      drafts: state.drafts,
      scanRules: state.scanRules,
      setDrafts: state.setDrafts
    }))
  );

  const [isPending, setIsPending] = useState(false);
  const [selected, setSelected] = useState(new Set<string>());
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  
  const [curDrafts, setCurDrafts] = useState(drafts);
  const curDraftsKeys = Object.keys(curDrafts);
  useEffect(()=>{
    // TODO : drafts가 변경되도 화면 업데이트가 안되는 문제를 -> 이 코드가 drafts가 바뀔 때 list를 재랜더링해줘서 해결한 원리 연구하기
    // - flushSync도 안통했음, background asnyc 문제도 아님, setTimeOut으로 느리게 업데이트도 안통했음.
    // - drafts가 바뀌어도 curDrafts가 바뀌지 않아서 화면이 업데이트 안됨.(유일하게 {}= 빈칸으로 바뀔때만 됨)
    // - 근데 왜 이놈은 되는가?
    setCurDrafts(drafts);
  },[drafts]);
  
  const {t} = useTranslation('page', {keyPrefix: 'detectPage'});  
  const {t:tError} = useTranslation('error');
  const {t:tCommon} = useTranslation('common');
  const {isInspectionMode,cancleInspectionMode}= useInspection();
  const requestExtracteds = async () => {
    if (isPending) return;
    setIsPending(true);
    const scanRuleArray = Object.values(scanRules);
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPE.REQUEST_DETECTED_DRAFTS_FROM_PANEL,
      data: scanRuleArray,
    }, (response: Response) => {
        if (response.res==='error') {
          if (response.error === 'Could not establish connection. Receiving end does not exist.'){
            alert(tError('common.noContentErrorSolution'));
          } else {
            alert(response.error);
          }
          setIsPending(false);
          return;
        }
        const em = response.response as ExtractedInfos;
        let cnt = 0;
        let tempDrafts= {} as {[key:string]:Draft};
        Object.keys(em).forEach((key)=>{
          const numberKey = Number(key);
          const extractedInfos = em[numberKey];
          
          extractedInfos.forEach((extracted, idx)=>{
            const id = key + "-" + idx;
            tempDrafts[id] = getNote(scanRuleArray[numberKey], extracted);
            cnt++;
          });
        });
        
        setDrafts(tempDrafts);
        setCurDrafts(tempDrafts);
        setIsPending(false);
    });

  };

  const checkAdd = (id:string)=>(val:boolean)=>{
    const newSelected = new Set(selected);
    if (val) newSelected.add(id);
    else newSelected.delete(id);
    setSelected(newSelected);
  }
  const checkAll = ()=>{setSelected(new Set(curDraftsKeys));};
  const uncheckAll = ()=>{setSelected(new Set());}

  const getNote = (scanRule : ScanRule, extracted : ExtractedFields) =>{    
    let fields = [] as Draft['fields'];
    for (const fieldName of Object.keys(scanRule.fields)) {
      let value = extracted[fieldName];
      fields.push({key: fieldName, content: value});
    }
    return ({
            scanRuleId: scanRule.scanRuleName,
            deckId: currentDeckId,
            modelId: scanRule.modelId,
            fields,
            tagIds: scanRule.tagIds || [],
            audio: scanRule.audio ? {
              url: scanRule.audio.url,
              filename: scanRule.audio.filename,
              skipHash: scanRule.audio.skipHash,
              fields: scanRule.audio.fields,
            } : undefined,
          }) as Draft;
  }

  const deleteSelected = ()=>{
    if (confirm(t('delete|count|DraftConfirm', {count: selected.size}))){
      let newDrafts = {} as typeof drafts;
      Object.keys(drafts).filter((key)=>!selected.has(key)).forEach((key)=>{
        newDrafts[key] = drafts[key];
      })
      setDrafts(newDrafts);
    }
  }
  
  const addSelected = async ()=>{   
    if (!confirm(t('add|count|DraftConfirm', {count: selected.size}))) return;
    if (!isConnected) {
      alert(tError('addNote.addNoteFail.statusText') +' ' +tError('common.ankiNotConnected'));
      return;
    }
    if (currentDeckId === null||currentDeckId === ''){
      console.log('No deck selected');
      setErrorMessages([tError('detectPage.selectDeckFirst.statusText')]);
      return;
    }
    if (selected.size === 0) {
      alert(tError('addNote.addNoteFail.statusText') + ' ' +tError('detectPage.noSelectedDraft.description'));
      return;
    }
    let notes = [];
    for (const key of selected){
      let updatedNote = {...drafts[key]};
      if (models[updatedNote.modelId] === undefined) {
        alert(tError('addNote.addNoteFail.statusText') + ' ' +tError('addNote.modelNotFoundError.statusText'));
        return;
      }
      for (const fieldName in updatedNote.fields){
        let content = updatedNote.fields[fieldName].content;
        let res = await processMediaInHtml(content);
        if (res.result==='error'){
          alert(tError('addNote.addNoteFail.statusText') + ' ' + res.error);
          return;
        }
        updatedNote.fields[fieldName].content = res.data;
      }
      notes.push(updatedNote);
    }

    await fetchAnki({action: "addNotes",params: { notes : notes.map((note)=>({
      deckName: currentDeckId,
      modelName: models[note.modelId].name,
      fields: note.fields.reduce((acc, field) => {
        acc[field.key] = field.content;
        return acc;
      }, {} as {[key:string]: string}),      
      tags: note.tagIds,
    }))}})
    .then((res) => {
      if (res.error) {
        console.error('Error adding note to Anki:', res.error);
        alert(tError('addNote.addNoteFail.statusText') + res.error);
      } else {
        console.log('Note added to Anki with ID:', res.result);
        alert(t('addNoteSuccess'));
      }
    });
  }
  return (
    <div className={detectPageStyle.pageContainer}>
      <div className={detectPageStyle.header}>
        <div className={detectPageStyle.deckInput} style={{display:'flex', gap:'4px', alignItems:'center'}}>
          <div>
            <Icon url={DeckIcon} title={tCommon('deck')}/>
          </div>
          <DeckInput
            initDeckId={currentDeckId}
            onChange={(e)=>{
              setCurrentDeckId(e.target.value);
            }}
            errorMessages={errorMessages}
          /> 
        </div>
        <SimpleButton disabled={isPending} className={detectPageStyle.redetectDraft} onClick={requestExtracteds}>
          {isPending ? t("scanning") : '↺ '+t("scan")}
        </SimpleButton>
        { selected.size == curDraftsKeys.length ? 
        <SimpleButton src={UncheckIcon} 
        onClick={uncheckAll}
        text={t('uncheckAll')}
        /> :
        <SimpleButton src={CheckIcon}
        onClick={checkAll}
        text={t('checkAll')}
        /> }
      </div>
      <div className={detectPageStyle.draftsWrapper}>
        {curDrafts && curDraftsKeys.length > 0 ? (
          curDraftsKeys.map((key) => { 
            const note = curDrafts[key];
            if (!note) return null;
            return (
              <DetectedDraft 
                key={key}
                idx={key}
                note={note} 
                scanRuleId={note.scanRuleId} 
                checkAdd={checkAdd(key)}
                isChecked={selected.has(key)}
              />
            );
          })
        ) : (
          <div className={detectPageStyle.noDrfat}>{t("noDraftDetected")}</div>
        )}
      </div>
      {isInspectionMode && <InspectionOverlay mode={INSPECTION_MODE.FIELD_EXTRACTION} cancleInspectionMode={cancleInspectionMode}/>}
      
      {/* Add & Delete Selected Drafts buttons*/}
      {selected.size > 0 ? <>
        <div style={{height:'45px'}} /> {/* for button space */} 
        <div className={detectPageStyle.floatBtns}>
          <SimpleButton src={AddIcon} onClick={addSelected} text={selected.size > 0 ? `${selected.size}` : t('add')}/>
          <SimpleButton src={DelIcon} onClick={deleteSelected} text={selected.size > 0 ? `${selected.size}` : tCommon('delete')}/>
        </div>
      </>:null}
    </div>
  );
};

export default DetectPage;
