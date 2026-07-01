import detectPageStyle from '@/panel/features/Detect/detectPage.module.css';
import { useState } from 'react';
import DetectedDraft from './DetectedDraft/DetectedDraft';
import DeckInput from '@/panel/components/Inputs/DeckInput/DeckInput';
import AddIcon from '@/public/Icon/Icon-Add.svg';
import DeckIcon from '@/public/Icon/Icon-Decks.svg';
import useAnkiConnectionStore from '@/panel/stores/useAnkiConnectionStore';
import useGlobalVarStore from '@/panel/stores/useGlobalVarStore';
import useScanRule from '@/panel/stores/useScanRule';
import { ExtractedFields, ExtractedInfos,  FIELD_DATA_TYPES,  Draft, ScanRule } from '@/types/scanRule.types';
import { MESSAGE_TYPE, Response } from '@/types/chrome.types';
import SimpleButton from '@/panel/components/Inputs/SimpleButton/SimpleButton';
import { useTranslation } from 'react-i18next';
import Icon from '@/panel/components/Icon/Icon';
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
  const [isPending, setIsPending] = useState(false);
  const [selected, setSelected] = useState(new Set<string>());
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const {fetchAnki} = useAnkiConnectionStore();
  const {currentDeckId, setCurrentDetected, setCurrentDeckId} = useGlobalVarStore();
  const {drafts,scanRules, setDrafts} = useScanRule(
    useShallow((state)=>({
    drafts: state.drafts,
    scanRules: state.scanRules,
    setDrafts: state.setDrafts
    }))
  );
  const {t} = useTranslation('page', {keyPrefix: 'detectPage'});  
  const {t:tError} = useTranslation('error');
  const {t:tCommon} = useTranslation('common');
  const {isInspectionMode,cancleInspectionMode}= useInspection();
  const requestExtracteds = async () => {
    if (isPending) return;
    setIsPending(true);
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPE.REQUEST_DETECTED_DRAFTS_FROM_PANEL,
      data: scanRules,
    }, (response: Response) => {
        console.log("receive detected drafts", response);
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
        setIsPending(false);
        Object.keys(em).map((key)=>{
          console.log('key', key);
          const numberKey = Number(key);
          const extractedInfos = em[numberKey];
          extractedInfos.forEach((extracted, idx)=>{
            const id = key + "-" + idx;
            tempDrafts[id] = (getNote(scanRules[numberKey],extracted));
          });
        });
        setCurrentDetected(cnt);
        setDrafts(tempDrafts);
    });
  };

  const checkAdd = (id:string)=>(val:boolean)=>{
    const newSelected = new Set(selected);
    if (val) newSelected.add(id);
    else newSelected.delete(id);
    setSelected(newSelected);
  }

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
  const addSelected = async ()=>{   
    if (currentDeckId === null||currentDeckId === ''){
      console.log('No deck selected');
      setErrorMessages([tError('detectPage.selectDeckFirst.statusText')]);
      return;
    }
    let notes = [];
    for (const key of selected){
      let curNote = drafts[key];
      for (const field in curNote.fields){
        let content = curNote.fields[field].content;
        curNote.fields[field].content = await processMediaInHtml(content);
        notes.push(curNote);
      }
    }

    await fetchAnki({action: "addNotes",params: { notes : notes.map((note)=>({
      note,
      deckName: currentDeckId
    }))}})
    .then((res) => {
      console.log(res);
      if (res.error) {
        console.error('Error adding note to Anki:', res.error);
        alert(tError('detectPage.addNoteFail.statusText') + res.error);
      } else {
        console.log('Note added to Anki with ID:', res.result);
        alert(t('addNoteSuccess'));
      }
    });
  }
  return (
    <div className={detectPageStyle.pageContainer}>
      <div className={detectPageStyle.header}>
        <div style={{display:'flex', gap:'4px', alignItems:'center'}}>
          <Icon url={DeckIcon} title={tCommon('deck')}/>
          <DeckInput
            initDeckId={currentDeckId}
            onChange={(e)=>{
              setCurrentDeckId(e.target.value);
            }}
            errorMessages={errorMessages}
          /> 
        </div>
        <div className={detectPageStyle.headerButtons}>
          <SimpleButton disabled={isPending} className={detectPageStyle.redetectDraft} onClick={requestExtracteds}>
            {isPending ? t("scanning") : '↺ '+t("scan")}
          </SimpleButton>
        </div>
        <SimpleButton src={AddIcon} onClick={addSelected} text={selected.size > 0 ? `+ ${selected.size}` : t('add')}/>
      </div>

      <div className={detectPageStyle.draftsWrapper}>
        {drafts && Object.keys(drafts).length > 0 ? (
          Object.keys(drafts).map((key) => { 
            const note = drafts[key];
            if (!note) return null;
            return (
              <DetectedDraft 
                key={key}
                idx={key}
                note={note} 
                scanRuleId={note.scanRuleId} 
                checkAdd={checkAdd(key)}
              />
            );
          })
        ) : (
          <div className={detectPageStyle.noDrfat}>{t("noDraftDetected")}</div>
        )}
      </div>
      {isInspectionMode && <InspectionOverlay mode={INSPECTION_MODE.FIELD_EXTRACTION} cancleInspectionMode={cancleInspectionMode}/>}
    </div>
  );
};

export default DetectPage;
