import detectPageStyle from '@/front/pages/Detect/detectPage.module.css';
import { JSX, useEffect, useState } from 'react';
import useCustomCard from '@/front/utils/useTemplates';
import DetectedCard from './DetectedCard/DetectedCard';
import DeckInput from '@/front/components/StatusBar/DeckInput/DeckInput';
import InfoIcon from '@/public/Icon/Icon-Info.svg';

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
  const {customCards} = useCustomCard();
  const [extractedMaps, setExtractedMaps] = useState<ExtractedMap>({});
  const [url, setUrl] = useState<string>(''); 
  const [isPending, setIsPending] = useState(false);
  let pendingId : NodeJS.Timeout;
  const requestExtracteds = async () => {
    console.log('Requesting detected cards from content script');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) {
      console.warn('No active tab found!');
      return;
    }
    console.log(customCards)
    setIsPending(true);
    chrome.tabs.sendMessage(tab.id, {
      type: 'REQUEST_DETECTED_CARDS',
      customCards,
    });
    pendingId = setInterval(()=>{
      setIsPending(false);
    },5000);
  };
  
  useEffect(()=>{
    chrome.runtime.onMessage.addListener((message)=>{
      if (message.type === 'SEND_DETECTED_CARDS'){
        console.log("Received detected cards from content script:", message.data);
        setExtractedMaps(message.data);
        setUrl(message.URL);
        setIsPending(false);
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
        <InfoIcon/>
      </div>

      <div className={detectPageStyle.cardsWrapper}>
        {extractedMaps && Object.keys(extractedMaps).length > 0 ? (
          Object.keys(extractedMaps).flatMap((key) => {
            const numberKey = Number(key);
            const cardInfos = extractedMaps[numberKey];
            const cards :JSX.Element[] = [];
            cardInfos.forEach((extracted, idx)=>{
              cards.push(
                <DetectedCard 
                key={key + "-" + idx}
                customCard={customCards[numberKey]}
                extracted={extracted}
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
