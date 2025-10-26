import { useEffect, useState } from "react";
import AnkiPng from "@/public/Anki-Png.png";
import ResetSvg from "@/public/Reset-Vector.svg";
import commonStyle from "@/popup/css/common.module.css";
import ankiStatusStyle from "@/popup/css/ankiStatus.module.css";

const AnkiStatus = ({}) => { 
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    let setLoader = ()=>setIsLoading(true);
    let unsetLoader = ()=>setIsLoading(false); 
    let timeoutId:NodeJS.Timeout;

    const checkConnection = async () => {
        setLoader();
        await fetch('http://127.0.0.1:8765', {
        method: 'POST',
        body: JSON.stringify({ action: 'deckNames', version: 5 }),
    })
      .then(async (res) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(()=>unsetLoader(),1000);
        const data = await res.json();
        setIsConnected(data.error === null);      
      })
      .catch((err) => {
        console.log(err);
        timeoutId = setTimeout(()=>unsetLoader(),1000);
        unsetLoader();
        setIsConnected(false);
      });
  };
  useEffect(()=>{checkConnection()},[]);
  return (
  <div className={`${commonStyle["no-select"]} ${commonStyle.tooltip}`} style={{display: 'flex', justifyContent: "space-around", width: '64px', margin: 'auto'}}>
    <span className={`${commonStyle.tooltiptext}`}>Anki {isConnected ? 'connected' : 'disconnected'}</span>
    <img className={(isLoading ? `${ankiStatusStyle.spinning}`:'')} src={AnkiPng} width={20} height={20}/>
    <span style={{color:isConnected ? 'greenyellow' : 'red'}}>●</span>
    <ResetSvg className={`${ankiStatusStyle["reset-btn"]} ${ankiStatusStyle.btn}`} onClick={()=>checkConnection()} width={20} height={20}/>
  </div>);
};
export default AnkiStatus;