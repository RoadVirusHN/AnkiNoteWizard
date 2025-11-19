import useCustomCard from "@/front/utils/useTemplates";
import commonStyles from "@/front/common.module.css";
import customPageStyles from "./customPage.module.css";
import { useState } from "react";
const CustomPage: React.FC = () => {
  const {templates: customCards, removeTemplate: removeCustomCard} = useCustomCard();
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
          {card.templateName} 
          <span style={{cursor: "pointer"}} onClick={()=>{
            if (confirm(`정말 "${card.templateName}" 카드를 삭제하시겠습니까?`)){
              removeCustomCard(index)
            }
          }}> -</span>
        </div>)}
        <div onClick={openAddCustomCardModal} style={{cursor: 'pointer'}}>⨁</div>
      </div>
        <div className={customPageStyles.detail}>
          {curIdx!==null && customCards[curIdx] && 
            <>
              <h2 style={{margin: '0px'}}>{customCards[curIdx].templateName}</h2>
              <p>{customCards[curIdx].meta.description}</p>
              <div className={customPageStyles.cardDetail}>
                  {
                    isFront ? 
                      <div style={{width: '100%'}}>
                        <h3 style={{margin: '0px'}}>Front HTML</h3>
                        <pre className={customPageStyles.codeBlock}>{customCards[curIdx].Front.html}</pre>
                        <h4 style={{margin: '0px'}}>Front Fields</h4>
                        <ul>
                          {customCards[curIdx].Front.fields.map((field, i) => 
                            <li key={i}>{field.name} ({field.dataType})</li>
                          )}
                        </ul>
                      </div> :
                      <div style={{width: '100%'}}>
                        <h3 style={{margin: '0px'}}>Back HTML</h3>
                        <pre className={customPageStyles.codeBlock}>{customCards[curIdx].Back.html}</pre>
                        <h4 style={{margin: '0px'}}>Back Fields</h4>
                        <ul>
                          {customCards[curIdx].Back.fields.map((field, i) => 
                            <li key={i}>{field.name} ({field.dataType})</li>
                          )}
                        </ul>
                      </div>
                }
              </div>
            </>
          }
        </div>
    </div>
  );
};

export default CustomPage;
