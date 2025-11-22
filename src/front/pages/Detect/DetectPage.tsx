import detectPageStyle from '@/front/pages/Detect/detectPage.module.css';
import { JSX, useEffect, useState } from 'react';
import useCustomCard, { Note, Template, TemplateFieldDataType } from '@/front/utils/useTemplates';
import DetectedCard from './DetectedCard/DetectedCard';
import DeckInput from '@/front/components/StatusBar/DeckInput/DeckInput';
import AddIcon from '@/public/Icon/Icon-Add.svg';
import SimpleButton from '@/front/components/SimpleButton/SimpleButton';
import useAnkiConnectionStore from '@/front/utils/useAnkiConnectionStore';
import useGlobalVarStore from '@/front/utils/useGlobalVarStore';

const buildCard = (key: 'Front' | 'Back', customCard: Template, extracted: Extracted) =>
  customCard[key].html.replaceAll(/\{\{(.*?)\}\}/g, 
    (_, fieldName) => {
      const fieldInfo = customCard[key].fields.find(f=>f.name === fieldName);
      if (fieldInfo) {
        switch (fieldInfo.dataType) {
          case TemplateFieldDataType.IMAGE:
            return `<img src="${extracted[key][fieldName] || ''}" />`;
          case TemplateFieldDataType.AUDIO:
            return `[sound:${extracted[key][fieldName] || ''}]`;
          default:
            return extracted[key][fieldName] || '';
        }
      }
      return ''; // Ensure a string is always returned
    }
  );
//TODO : Apply SCSS for css.
//TODO : MAKE Interfaces&Types FILE
//TODO : change cards to key value pair
export interface Extracted{
  Front : Record<string, string>;
  Back : Record<string, string>;
}
export interface ExtractedMap{
  [idx: number]: Extracted[];
};

// REQUEST_DETECTED_CARDS : content script 에게 현재 페이지에서 추출된 카드 데이터를 요청
// - customCards : 사용자가 정의한 카드 템플릿들
// SEND_DETECTED_CARDS : content script에서 감지된 카드 데이터를 CardPage로 전송
// - extracteds : 감지된 카드 데이터 배열, url : 현재 페이지 URL

const DetectPage: React.FC = () => {
  const {templates: customCards} = useCustomCard();
  const [extractedMaps, setExtractedMaps] = useState<ExtractedMap>({});
  const [url, setUrl] = useState<string>(''); 
  const [isPending, setIsPending] = useState(false);
  const [notes, setNotes] = useState<{[idx:string]:Note}>({});
  const [selected, setSelected] = useState(new Set<string>());
  const {fetchAnki} = useAnkiConnectionStore();
  const {currentDeck} = useGlobalVarStore();

  let pendingId : NodeJS.Timeout;
  const requestExtracteds = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) {
      console.warn('No active tab found!');
      return;
    }
    setIsPending(true);
    chrome.tabs.sendMessage(tab.id, {
      type: 'REQUEST_DETECTED_CARDS',
      customCards,
    });
    pendingId = setInterval(()=>{
      setIsPending(false);
    },5000);
  };

  const toggleSelected = (id:string)=>()=>{
    const newSelected = new Set(selected);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelected(newSelected);
  }

  const getNote = (customCard : Template, extracted : Extracted) =>{    
    const buildedFront = buildCard("Front",customCard,extracted);
    const buildedBack = buildCard("Back", customCard, extracted);

    return ({
            deckName: currentDeck || 'Default',
            modelName: customCard.modelName || 'Basic',
            fields: {
              Front: buildedFront || 'Something Wrong with Front',
              Back:  buildedBack || 'Something Wrong with Back',
            },
            audio: customCard.audio ? {
              url: customCard.audio.url,
              filename: customCard.audio.filename,
              skipHash: customCard.audio.skipHash,
              fields: customCard.audio.fields,
            } : undefined,
            tags: customCard.tags || [],
          });
  }
  const addSelected = ()=>{    
    fetchAnki({action: "addNotes",params: { notes : selected.keys().map((i)=>notes[i])}});
  }
  
  useEffect(()=>{
    chrome.runtime.onMessage.addListener((message)=>{
      if (message.type === 'SEND_DETECTED_CARDS'){
        console.log("Received detected cards from content script:", message.data);
        const em = message.data as ExtractedMap;
        setUrl(message.URL);
        setIsPending(false);
        const newNotes = {} as typeof notes;
        Object.keys(em).map((key)=>{
          const numberKey = Number(key);
          const cardInfos = em[numberKey];
          cardInfos.forEach((extracted, idx)=>{
            const id = key + "-" + idx;
            newNotes[id] = (getNote(customCards[numberKey],extracted));
          });
        });
        setNotes(newNotes);
        setExtractedMaps(em);
        clearInterval(pendingId);
      }
    });
    return ()=>clearInterval(pendingId);
  },[]);
  useEffect(()=>{
    if (customCards.length > 0) {
      requestExtracteds();
    }
  },[customCards]);
  return (
    <div className={detectPageStyle.pageContainer}>

      <div className={detectPageStyle.header}>
        <DeckInput/> 
        <div className={detectPageStyle.headerButtons}>
          <button disabled={isPending} className={detectPageStyle.redetectCard} onClick={requestExtracteds}>
            {isPending ? 'Scanning...': '↺ Rescan'}
          </button>
        </div>
        <SimpleButton Svg={AddIcon} onClick={addSelected} text={selected.size > 0 ? `+ ${selected.size}` :'Add'}/>
      </div>

      <div className={detectPageStyle.cardsWrapper}>
        {extractedMaps && Object.keys(extractedMaps).length > 0 ? (
          Object.keys(extractedMaps).flatMap((key) => {
            const numberKey = Number(key);
            const cardInfos = extractedMaps[numberKey];
            const cards :JSX.Element[] = [];
            cardInfos.forEach((extracted, idx)=>{
              const id = key + "-" + idx;
              cards.push(
                <DetectedCard 
                key={id}
                note={notes[id]}
                extracted={extracted}
                toggleSelected={toggleSelected(id)}
                onChange={(newNote : Note)=>{
                  const newNotes = {} as typeof notes;
                  Object.keys(notes).forEach((key)=>{
                    newNotes[key] = key === id? newNote : notes[key];
                  });
                  setNotes(newNotes);
                }}
                />
              );
            })
            return cards;
          })
        ) : (
          <div className={detectPageStyle.noCard}>감지된 카드가 없습니다.</div>
        )}
      </div>
    </div>
  );
};

export default DetectPage;
