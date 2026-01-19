import detectPageStyle from '@/front/pages/Detect/detectPage.module.css';
import { JSX, useState } from 'react';
import useCustomCard, { Extracted, ExtractedMap, Note, Template, TemplateFieldDataType } from '@/front/utils/useTemplates';
import DetectedCard from './DetectedCard/DetectedCard';
import DeckInput from '@/front/common/StatusBar/DeckInput/DeckInput';
import AddIcon from '@/public/Icon/Icon-Add.svg';
import SimpleButton from '@/front/common/SimpleButton/SimpleButton';
import useAnkiConnectionStore from '@/front/utils/useAnkiConnectionStore';
import useGlobalVarStore from '@/front/utils/useGlobalVarStore';
import useTemplate from '@/front/utils/useTemplates';
import { MessageType } from '@/scripts/background/messageHandler';
import { useTranslation } from 'react-i18next';

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
  
  // TODO : make it as hook.
  const {t} = useTranslation();
  const tl = (key:string)=>t('pages.DetectPage.'+key);
  
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
    const buildedFront = buildCard("Front",customCard,extracted);
    const buildedBack = buildCard("Back", customCard, extracted);

    return ({
            deckName: currentDeck || 'Default',
            modelName: customCard.modelName || 'Basic',
            templateName: customCard.templateName,
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
          <button disabled={isPending} className={detectPageStyle.redetectCard} onClick={requestExtracteds}>
            {isPending ? tl("Scanning") : '↺ '+tl("Scan")}
          </button>
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
