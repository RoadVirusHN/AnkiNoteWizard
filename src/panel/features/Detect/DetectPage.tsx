import detectPageStyle from '@/panel/features/Detect/detectPage.module.css';
import { useState } from 'react';
import useCustomCard from '@/panel/stores/useScanRule';
import DetectedDraft from './DetectedDraft/DetectedDraft';
import DeckInput from '@/panel/components/Inputs/DeckInput/DeckInput';
import AddIcon from '@/public/Icon/Icon-Add.svg';
import useAnkiConnectionStore from '@/panel/stores/useAnkiConnectionStore';
import useGlobalVarStore from '@/panel/stores/useGlobalVarStore';
import useScanRule from '@/panel/stores/useScanRule';
import { ExtractedFields, ExtractedInfos,  FIELD_DATA_TYPES,  Note, ScanRule } from '@/types/scanRule.types';
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
  const {scanRules: scanRules} = useCustomCard();
  const [isPending, setIsPending] = useState(false);
  const [selected, setSelected] = useState(new Set<string>());
  const {fetchAnki} = useAnkiConnectionStore();
  const {currentDeck, setCurrentDetected} = useGlobalVarStore();
  const {notes, setNotes} = useScanRule();
  
  const {t} = useTranslation('page', {keyPrefix: 'detectPage'});  
  const requestExtracteds = async () => {
    setIsPending(true);
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPE.REQUEST_DETECTED_CARDS_FROM_PANEL,
      data: scanRules,
    }, (response) => {
        console.log("receive detected cards", response);
        const em = response as ExtractedInfos;
        let cnt = 0;
        setIsPending(false);
        const newNotes = {} as typeof notes;
        Object.keys(em).map((key)=>{
          const numberKey = Number(key);
          const extractedInfos = em[numberKey];
          extractedInfos.forEach((extracted, idx)=>{
            const id = key + "-" + idx;
            newNotes[id] = (getNote(scanRules[numberKey],extracted));
          });
        });
        setCurrentDetected(cnt);
        setNotes(newNotes);
    });
  };

  const checkAdd = (id:string)=>(val:boolean)=>{
    const newSelected = new Set(selected);
    if (val) newSelected.add(id);
    else newSelected.delete(id);
    setSelected(newSelected);
  }

  const getNote = (scanRule : ScanRule, extracted : ExtractedFields) =>{    
    let fields = [] as Note['fields'];
    for (const fieldName of Object.keys(scanRule.fields)) {
      let value;
      if (scanRule.fields[fieldName].dataType === FIELD_DATA_TYPES.IMAGE) {
        value = '<img src=\"'+ extracted[fieldName] + '\"/>';
      } else if (scanRule.fields[fieldName].dataType === FIELD_DATA_TYPES.AUDIO) {
        value = '<audio src=\"' + extracted[fieldName] + '\" controls/>';
      } else if (scanRule.fields[fieldName].dataType === FIELD_DATA_TYPES.VIDEO) {
        value = '<video src=\"' + extracted[fieldName] + '\" controls/>';
      } else {
        value = extracted[fieldName];
      }
      fields.push({key: fieldName, content: value});
    }
    return ({
            scanRuleName: scanRule.scanRuleName,
            deckName: currentDeck || 'Default',
            modelId: scanRule.modelId || 'Basic',
            fields,
            tags: scanRule.tags || [],
            audio: scanRule.audio ? {
              url: scanRule.audio.url,
              filename: scanRule.audio.filename,
              skipHash: scanRule.audio.skipHash,
              fields: scanRule.audio.fields,
            } : undefined,
          }) as Note;
  }
  const addSelected = ()=>{   
    fetchAnki({action: "addNotes",params: { notes : [...selected.keys()].map((i)=>({
      ...notes[i],
      deckName: currentDeck
    }))}})
    .then((res) => {
      console.log(res);
      if (res.error) {
        console.error('Error adding note to Anki:', res.error);
        alert(t('addNoteFail') + res.error);
      } else {
        console.log('Note added to Anki with ID:', res.result);
        alert(t('addNoteSuccess'));
      }
    });
  }
  return (
    <div className={detectPageStyle.pageContainer}>
      <div className={detectPageStyle.header}>
        <DeckInput/> 
        <div className={detectPageStyle.headerButtons}>
          <SimpleButton disabled={isPending} className={detectPageStyle.redetectDraft} onClick={requestExtracteds}>
            {isPending ? t("scanning") : '↺ '+t("scan")}
          </SimpleButton>
        </div>
        <SimpleButton src={AddIcon} onClick={addSelected} text={selected.size > 0 ? `+ ${selected.size}` : t('add')}/>
      </div>

      <div className={detectPageStyle.draftsWrapper}>
        {notes && Object.keys(notes).length > 0 ? (
          Object.keys(notes).map((key) => { 
            const note = notes[key];
            return (
              <DetectedDraft 
                key={key} 
                note={note} 
                scanRuleName={note.scanRuleName} 
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
