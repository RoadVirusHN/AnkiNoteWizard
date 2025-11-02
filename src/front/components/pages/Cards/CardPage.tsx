import cardPageStyles from '@/front/components/pages/Cards/cardPage.module.css';
import { useEffect, useRef, useState } from 'react';
import Footer from '../../Footer/Footer';
import useCustomCard from '@/front/utils/useCustomCard';
import DetectedCard from './DetectedCard/DetectedCard';
//TODO : Apply SCSS for css.
//TODO : MAKE Interfaces&Types FILE
export interface Extracted{
  Front : Record<string, string>;
  Back : Record<string, string>;
}
export interface IdxedExtracted{
  customCardIndex: number,
  extracted: Extracted
};

// REQUEST_DETECTED_CARDS : content script 에게 현재 페이지에서 추출된 카드 데이터를 요청
// - customCards : 사용자가 정의한 카드 템플릿들
// SEND_DETECTED_CARDS : content script에서 감지된 카드 데이터를 CardPage로 전송
// - extracteds : 감지된 카드 데이터 배열, url : 현재 페이지 URL

const CardPage: React.FC = () => {
  const {customCards} = useCustomCard();
  const [extracteds, setExtracteds] = useState<IdxedExtracted[]>([]);
  const [url, setUrl] = useState<string>(''); 
  const requestExtracteds = () =>{
    chrome.runtime.sendMessage({type: 'SEARCH_DETECTED_CARDS', customCards});
  }
  useEffect(()=>{
    chrome.runtime.onMessage.addListener((message)=>{
      if (message.type === 'URL_CHANGED') {
        chrome.runtime.sendMessage({type: 'SEARCH_DETECTED_CARDS', customCards});
      } else if (message.type === 'CARDS_DETECTED_UPDATE_REQUEST') {
        setExtracteds(message.extracteds);
        setUrl(message.URL);
      }
    });

    if (customCards.length > 0) {
      chrome.runtime.sendMessage({type: 'SEND_DETECTED_CARDS', customCards});
    }
  },[customCards])
  return (
    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px'}}>
      <span className={cardPageStyles.url}> {url} </span>
      {extracteds.map(({customCardIndex, extracted}, idx)=><DetectedCard key={idx} customCard={customCards[customCardIndex]} extracted={extracted}/>)}
      <span className={cardPageStyles.redetectCard} onClick={requestExtracteds}> ↺ </span>
      <Footer/>
    </div>
  );
};

export default CardPage;
