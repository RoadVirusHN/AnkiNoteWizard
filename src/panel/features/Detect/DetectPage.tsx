import detectPageStyle from '@/panel/features/Detect/detectPage.module.css';
import { useState } from 'react';
import DetectedDraft from './DetectedDraft/DetectedDraft';
import DeckInput from '@/panel/components/Inputs/DeckInput/DeckInput';
import AddIcon from '@/public/Icon/Icon-Add.svg';
import useAnkiConnectionStore from '@/panel/stores/useAnkiConnectionStore';
import useGlobalVarStore from '@/panel/stores/useGlobalVarStore';
import useScanRule from '@/panel/stores/useScanRule';
import { ExtractedFields, ExtractedInfos,  FIELD_DATA_TYPES,  Draft, ScanRule } from '@/types/scanRule.types';
import { MESSAGE_TYPE } from '@/types/chrome.types';
import SimpleButton from '@/panel/components/Inputs/SimpleButton/SimpleButton';
import { useTranslation } from 'react-i18next';

//TODO : Apply SCSS for css.
//TODO : MAKE Interfaces&Types FILE

// REQUEST_DETECTED_CARDS : content script 에게 현재 페이지에서 추출된 카드 데이터를 요청
// - customCards : 사용자가 정의한 카드 스캔 규칙들
// SEND_DETECTED_CARDS : content script에서 감지된 카드 데이터를 CardPage로 전송
// - extracteds : 감지된 카드 데이터 배열, url : 현재 페이지 URL
const DetectPage: React.FC = () => {
  const [isPending, setIsPending] = useState(false);
  const [selected, setSelected] = useState(new Set<string>());
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const {fetchAnki} = useAnkiConnectionStore();
  const {currentDeckId, setCurrentDetected, setCurrentDeckId} = useGlobalVarStore();
  const {getDrafts, getDraft,setDrafts, getScanRules} = useScanRule();
  const drafts = getDrafts();
  const scanRules = getScanRules();
  
  const {t} = useTranslation('page', {keyPrefix: 'detectPage'});  
  const {t:tError} = useTranslation('error', {keyPrefix: 'detectPage'});
  const requestExtracteds = async () => {
    setIsPending(true);
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPE.REQUEST_DETECTED_CARDS_FROM_PANEL,
      data: scanRules,
    }, (response) => {
        console.log("receive detected cards", response);
        const em = response as ExtractedInfos;
        let cnt = 0;
        let tempDrafts= {} as {[key:string]:Draft};
        setIsPending(false);
        Object.keys(em).map((key)=>{
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
      let value = '';
      for (const fieldProp of scanRule.fields[fieldName]) {   
          value = extracted[fieldName];
      }
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
  const addSelected = ()=>{   
    if (currentDeckId === null) {
      console.log('No deck selected');
      setErrorMessages([tError('selectDeckFirst.statusText')]);
      return;
    }
    fetchAnki({action: "addNotes",params: { notes : [...selected.keys()].map((i)=>({
      ...getDraft(i),
      deckName: currentDeckId
    }))}})
    .then((res) => {
      console.log(res);
      if (res.error) {
        console.error('Error adding note to Anki:', res.error);
        alert(tError('addNoteFail.statusText') + res.error);
      } else {
        console.log('Note added to Anki with ID:', res.result);
        alert(t('addNoteSuccess'));
      }
    });
  }
  return (
    <div className={detectPageStyle.pageContainer}>
      <div className={detectPageStyle.header}>
        <DeckInput
          initDeckId={currentDeckId}
          onChange={(e)=>{
            setCurrentDeckId(e.target.value);
          }}
          errorMessages={errorMessages}
        /> 
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
            const note = getDraft(key);
            if (!note) return null;
            return (
              <DetectedDraft 
                key={key} 
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
    </div>
  );
};

export default DetectPage;
