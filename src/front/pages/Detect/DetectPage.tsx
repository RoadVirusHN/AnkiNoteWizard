import detectPageStyle from '@/front/pages/Detect/detectPage.module.css';
import { useEffect, useState } from 'react';
import useCustomCard from '@/front/utils/useCustomCard';
import DetectedCard from './DetectedCard/DetectedCard';
//TODO : Apply SCSS for css.
//TODO : MAKE Interfaces&Types FILE
export interface Extracted{
  Front : Record<string, string>;
  Back : Record<string, string>;
}
export interface IdxedExtracted{
  cardName: string,
  extracted: Extracted
};

// REQUEST_DETECTED_CARDS : content script 에게 현재 페이지에서 추출된 카드 데이터를 요청
// - customCards : 사용자가 정의한 카드 템플릿들
// SEND_DETECTED_CARDS : content script에서 감지된 카드 데이터를 CardPage로 전송
// - extracteds : 감지된 카드 데이터 배열, url : 현재 페이지 URL

const DetectPage: React.FC = () => {
  const {customCards} = useCustomCard();
  const [extracteds, setExtracteds] = useState<IdxedExtracted[]>([]);
  const [url, setUrl] = useState<string>(''); 
  const requestExtracteds = async () => {
    console.log('Requesting detected cards from content script');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) {
      console.warn('No active tab found');
      return;
    }
    console.log(customCards)
    chrome.tabs.sendMessage(tab.id, {
      type: 'REQUEST_DETECTED_CARDS',
      customCards,
    });
  };
  
  useEffect(()=>{
    chrome.runtime.onMessage.addListener((message)=>{
      if (message.type === 'SEND_DETECTED_CARDS'){
        console.log("Received detected cards from content script:", message.data);
        setExtracteds(message.data);
        setUrl(message.URL);
      }
    });
  },[]);
  useEffect(()=>{
    if (customCards.length > 0) {
      requestExtracteds();
    }
  },[customCards]);
  return (
    <div className={detectPageStyle.pageContainer}>

      <div className={detectPageStyle.header}>
        <span className={detectPageStyle.url}>{url}</span>
        <div className={detectPageStyle.headerButtons}>
          <span className={detectPageStyle.redetectCard} onClick={requestExtracteds}>↺ 다시 감지</span>
        </div>
      </div>

      <div className={detectPageStyle.cardsWrapper}>
        {extracteds && extracteds.length > 0 ? (
          extracteds.map(({ cardName, extracted }, idx) => (
            customCards.find(card=>card.cardName===cardName) &&
            <DetectedCard 
              key={idx}
              customCard={customCards.find(card=>card.cardName===cardName)!}
              extracted={extracted}
            />
          ))
        ) : (
          <div className={detectPageStyle.noCard}>감지된 카드가 없습니다.</div>
        )}
      </div>
    </div>
  );
};

export default DetectPage;
