import { useEffect, useState, useTransition } from "react";
import AnkiPng from "@/public/Anki-Png.png";
import ResetSvg from "@/public/Reset-Vector.svg";
import commonStyle from "@/popup/common.module.css";
import ankiStatusStyle from "@/popup/components/AnkiStatus/ankiStatus.module.css";
import ToolTipWrapper from "../TooltipWrapper/ToolTipWrapper";
import fetchAnki from "@/popup/utils/fetchAnki";

const AnkiStatus = ({}) => { 
    const [isConnected, setIsConnected] = useState(false);
    const [isPending, startTransition] = useTransition();
    //TODO : delay && prevent checkConnection to preventing user spamming the anki connection check before the previous one is finished.
    const checkConnection = async () => { //TODO : check out the "useCallback" hook to optimize this function
      if (isPending) return;
      setIsConnected(false);
      startTransition(async ()=>{
        await fetchAnki<{result: string[], error: string | null}>({action:'deckNames'}).then((data)=>{
          console.log(data);
          setIsConnected(data?.error === null);
        }).catch((err)=>{
          console.log(err);
          setIsConnected(false);
        });
      });
    };
  // TODO : retry connection every X seconds when disconnected
  useEffect(()=>{checkConnection()},[]);
  return (
    <ToolTipWrapper 
      text={`Anki ${isConnected ? 'connected' : 'disconnected'}`} 
      classes={[commonStyle['no-select']]}
      styles={{display:'flex', justifyContent: 'space-around', gap:'5px', width: '64px', margin: 'auto'}}>
        <img className={(isPending ? `${ankiStatusStyle.spinning}`:'')} src={AnkiPng} width={20} height={20}/>
        <span style={{color:isPending ? 'gray' : (isConnected ? 'greenyellow' : 'red')}}>●</span>
        <ResetSvg className={`${ankiStatusStyle["reset-btn"]} ${ankiStatusStyle.btn}`} onClick={()=>checkConnection()} width={20} height={20}/>
    </ToolTipWrapper>
);
};
export default AnkiStatus;