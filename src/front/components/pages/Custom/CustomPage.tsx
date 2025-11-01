import useCustomCard from "@/front/utils/useCustomCard";
import commonStyles from "@/front/common.module.css";
import customPageStyles from "./customPage.module.css";
import { useState } from "react";
import CustomCardFooter from "../../CustomCardFooter/CustomCardFooter";
const CustomPage: React.FC = () => {
  const {customCards, removeCustomCard} = useCustomCard();
  const [curIdx, setCurIdx] =  useState<number|null>(customCards.length>0?0:null);
  const [isFront, setIsFront] = useState(true);
  const openAddCustomCardModal = () => {
    console.log("openAddCardModal");
    chrome.runtime.sendMessage({type: 'OPEN_MODIFY_CUSTOM_CARD_MODAL'});
  }
  const modifyCustomCard = (index: number) => {
    chrome.runtime.sendMessage({type: 'OPEN_MODIFY_CUSTOM_CARD_MODAL', index});
  }
  const selectCustomCard = (index: number) => {
    setCurIdx(index);
  }
  const onFlip = () => {  
    setIsFront(!isFront);
  };
  return (
    <div className={commonStyles.container}>
      <div className={`${customPageStyles.list}`}>
        {customCards.map((card, index) => 
        <div key={index} className={`${index === curIdx ? customPageStyles.selected : ''}`} onClick={()=>selectCustomCard(index)}>
          <span style={{cursor: "pointer"}} onClick={()=>modifyCustomCard(index)}> ↺ </span>
          {card.cardName} 
          <span style={{cursor: "pointer"}} onClick={()=>removeCustomCard(index)}> -</span>
        </div>)}
        <div onClick={openAddCustomCardModal} style={{cursor: 'pointer'}}>⨁</div>
      </div>
        <div className={customPageStyles.detail}>
          {curIdx!==null && customCards[curIdx] && 
            <>
              <h2>{customCards[curIdx].cardName}</h2>
              <p>{customCards[curIdx].description}</p>
              <div className={customPageStyles.cardDetail}>
                  {
                    isFront ? 
                      <div style={{width: '100%'}}>
                        <h3>Front HTML</h3>
                        <pre>{customCards[curIdx].Front.html}</pre>
                        <h4>Front Fields</h4>
                        <ul>
                          {customCards[curIdx].Front.fields.map((field, i) => 
                            <li key={i}>{field.name} ({field.selectorType}, {field.dataType})</li>
                          )}
                        </ul>
                      </div> :
                      <div style={{width: '100%'}}>
                        <h3>Back HTML</h3>
                        <pre>{customCards[curIdx].Back.html}</pre>
                        <h4>Back Fields</h4>
                        <ul>
                          {customCards[curIdx].Back.fields.map((field, i) => 
                            <li key={i}>{field.name} ({field.selectorType}, {field.dataType})</li>
                          )}
                        </ul>
                      </div>
                }
              </div>
            </>
          }
        </div>
      <CustomCardFooter onFlip={onFlip}/>
    </div>
  );
};

export default CustomPage;
