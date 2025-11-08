import { useEffect } from "react";
import AnkiPng from "@/public/Anki-Png.png";
import ResetSvg from "@/public/Reset-Vector.svg";
import commonStyle from "@/front/common.module.css";
import ankiStatusStyle from "./ankiStatus.module.css";
import ToolTipWrapper from "@/front/components/TooltipWrapper/ToolTipWrapper";
import useAnkiConnectionStore from "@/front/utils/useAnkiConnectionStore";


const AnkiStatus = () => { 
  const {isConnected, isPending, checkConnection} = useAnkiConnectionStore();

  useEffect(()=>{
    if (isConnected) return;
    checkConnection();
    const id = setInterval(()=> checkConnection(), 5000);
    return ()=> clearInterval(id); // cleanup on unmount
  }, [isConnected,checkConnection]);

  return (
    <ToolTipWrapper 
      text={`Anki ${isConnected ? 'connected' : 'disconnected'}`} 
      classes={[commonStyle['no-select']]}
      styles={{display:'flex', justifyContent: 'space-around', gap:'3px', width: '60px'}}>
        <img className={(isPending ? `${ankiStatusStyle.spinning}`:'')} src={AnkiPng} width={20} height={20}/>
        <span style={{color:isPending ? 'gray' : (isConnected ? 'greenyellow' : 'red')}}>●</span>
        {/* <ResetSvg className={`${ankiStatusStyle["reset-btn"]} ${ankiStatusStyle.btn}`} onClick={()=>checkConnection()} width={20} height={20}/> */}
    </ToolTipWrapper>
  );
};
export default AnkiStatus;