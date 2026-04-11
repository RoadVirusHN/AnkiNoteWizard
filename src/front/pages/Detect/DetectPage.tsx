import detectPageStyle from '@/front/pages/Detect/detectPage.module.css';
import { JSX, useState } from 'react';
import useCustomCard, { Extracted, ExtractedMap, Note, Template, TemplateItemDataType } from '@/front/utils/useTemplates';
import DetectedCard from './DetectedCard/DetectedCard';
import DeckInput from '@/front/common/StatusBar/DeckInput/DeckInput';
import AddIcon from '@/public/Icon/Icon-Add.svg';
import SimpleButton from '@/front/common/SimpleButton/SimpleButton';
import useAnkiConnectionStore from '@/front/utils/useAnkiConnectionStore';
import useGlobalVarStore from '@/front/utils/useGlobalVarStore';
import useTemplate from '@/front/utils/useTemplates';
import { MessageType } from '@/scripts/background/messageHandler';
import useLocale from '@/front/utils/useLocale';

const buildField = (key: string, customCard: Template, extracted: Extracted) =>{
  let target = customCard.fields.find((v)=>v.name===key);
  if (target!==undefined) {
    target.html.replaceAll(/\{\{(.*?)\}\}/g, (_, itemName) => {
      const itemInfo = target.items.find(i=>i.name === itemName);
      if (itemInfo) {
        switch (itemInfo.dataType) {
          case TemplateItemDataType.IMAGE:
            return `<img src="${extracted[key][itemName] || ''}" />`;
          case TemplateItemDataType.AUDIO:
            return `[sound:${extracted[key][itemName] || ''}]`;
          default:
            return extracted[key][itemName] || '';
        }
      }
      return ''; // Ensure a string is always returned
    });        
  }
  return target ? target.html : '';
}
//TODO : Apply SCSS for css.
//TODO : MAKE Interfaces&Types FILE

// REQUEST_DETECTED_CARDS : content script 에게 현재 페이지에서 추출된 카드 데이터를 요청
// - customCards : 사용자가 정의한 카드 템플릿들
// SEND_DETECTED_CARDS : content script에서 감지된 카드 데이터를 CardPage로 전송
// - extracteds : 감지된 카드 데이터 배열, url : 현재 페이지 URL
const DetectPage: React.FC = () => {
  const {templates} = useCustomCard();
  const [isPending, setIsPending] = useState(false);
  const [selected, setSelected] = useState(new Set<string>());
  const {fetchAnki} = useAnkiConnectionStore();
  const {currentDeck, setCurrentDetected} = useGlobalVarStore();
  const {notes, extractedMaps, setNotes, setExtractedMaps} = useTemplate();
  
  const tl = useLocale('pages.DetectPage');  
  const requestExtracteds = async () => {
    setIsPending(true);
    chrome.runtime.sendMessage({
      type: MessageType.REQUEST_DETECTED_CARDS_FROM_PANEL,
      data: templates,
    }, (response) => {
        console.log("receive detected cards", response);
        const em = response[0] as ExtractedMap;
        setCurrentDetected(response[1] as number);
        setIsPending(false);
        const newNotes = {} as typeof notes;
        Object.keys(em).map((key)=>{
          const numberKey = Number(key);
          const cardInfos = em[numberKey];
          cardInfos.forEach((extracted, idx)=>{
            const id = key + "-" + idx;
            newNotes[id] = (getNote(templates[numberKey],extracted));
          });
        });
        setNotes(newNotes);
        setExtractedMaps(em);
    });
  };

  const checkAdd = (id:string)=>(val:boolean)=>{
    const newSelected = new Set(selected);
    if (val) newSelected.add(id);
    else newSelected.delete(id);
    setSelected(newSelected);
  }

  const getNote = (customCard : Template, extracted : Extracted) =>{    
    let fields = {} as Note['fields'];
    for (const field of customCard.fields) {
      fields[field.name] = buildField(field.name, customCard, extracted);
    }
    return ({
            templateName: customCard.templateName,
            deckName: currentDeck || 'Default',
            modelName: customCard.model.name || 'Basic',
            fields,
            tags: customCard.tags || [],
            audio: customCard.audio ? {
              url: customCard.audio.url,
              filename: customCard.audio.filename,
              skipHash: customCard.audio.skipHash,
              fields: customCard.audio.fields,
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
        {extractedMaps && Object.keys(extractedMaps).length > 0 ? (
          Object.keys(extractedMaps).flatMap((key) => {
            const numberKey = Number(key);
            const cardInfos = extractedMaps[numberKey];
            const cards :JSX.Element[] = [];
            cardInfos.forEach((extracted, idx)=>{
              const id = key + "-" + idx;
              if (!notes[id]) return; // Skip if note doesn't exist
              cards.push(
                <DetectedCard 
                key={id}
                idx={id}
                extracted={extracted}
                template={templates[numberKey]}
                checkAdd={checkAdd(id)}
                />
              );
            })
            return cards;
          })
        ) : (
          <div className={detectPageStyle.noCard}>{tl("No Note Detected")}</div>
        )}
      </div>
    </div>
  );
};

export default DetectPage;
