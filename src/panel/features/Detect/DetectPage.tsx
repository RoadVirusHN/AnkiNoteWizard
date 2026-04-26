import detectPageStyle from '@/panel/features/Detect/detectPage.module.css';
import { JSX, useState } from 'react';
import useCustomCard from '@/panel/stores/useScanRule';
import DetectedDraft from './DetectedDraft/DetectedDraft';
import DeckInput from '@/panel/components/StatusBar/DeckInput/DeckInput';
import AddIcon from '@/public/Icon/Icon-Add.svg';
import SimpleButton from '@/panel/components/SimpleButton/SimpleButton';
import useAnkiConnectionStore from '@/panel/stores/useAnkiConnectionStore';
import useGlobalVarStore from '@/panel/stores/useGlobalVarStore';
import useScanRule from '@/panel/stores/useScanRule';
import useLocale from '@/panel/hooks/useLocale';
import { ExtractedFields, ExtractedInfos,  FieldContent,  Note, ScanRule } from '@/types/scanRule.types';
import { MESSAGE_TYPE } from '@/types/chrome.types';

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
  
  const tl = useLocale('pages.DetectPage');  
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
    let fields = {} as Note['fields'];
    for (const fieldName of Object.keys(scanRule.fields)) {
      fields[fieldName] = {
        value: extracted[fieldName],
        dataType: scanRule.fields[fieldName].dataType,
      }
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
        alert(tl('Failed to add note') + res.error);
      } else {
        console.log('Note added to Anki with ID:', res.result);
        alert(tl('Note added successfully'));
      }
    });
  }
  return (
    <div className={detectPageStyle.pageContainer}>

      <div className={detectPageStyle.header}>
        <DeckInput/> 
        <div className={detectPageStyle.headerButtons}>
          <SimpleButton disabled={isPending} className={detectPageStyle.redetectCard} onClick={requestExtracteds}>
            {isPending ? tl("Scanning") : '↺ '+tl("Scan")}
          </SimpleButton>
        </div>
        <SimpleButton src={AddIcon} onClick={addSelected} text={selected.size > 0 ? `+ ${selected.size}` : tl('Add')}/>
      </div>

      <div className={detectPageStyle.cardsWrapper}>
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
          <div className={detectPageStyle.noCard}>{tl("No Note Detected")}</div>
        )}
      </div>
    </div>
  );
};

export default DetectPage;
