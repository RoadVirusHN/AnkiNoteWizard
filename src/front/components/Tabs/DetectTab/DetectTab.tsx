import { NavLink } from "react-router";
import tabsStyle from "../tabs.module.css";
import useGlobalVarStore, { Tab } from "@/front/utils/useGlobalVarStore";
import AnkiIcon from '@/public/Icon/Icon-Anki.svg';
import useAnkiConnectionStore from "@/front/utils/useAnkiConnectionStore";
import { useEffect } from "react";
import TooltipWrapper, { TooltipDirection } from "../../TooltipWrapper/TooltipWrapper";
import commonStyle from "@/front/common.module.css";

const DetectTab = ({}) => {
  const {currentTab, currentDetected} = useGlobalVarStore();
  const {isConnected, isPending, checkConnection} = useAnkiConnectionStore();
  useEffect(()=>{
      if (isConnected) return;
      checkConnection();
      const id = setInterval(()=> checkConnection(), 5000);
      return ()=> clearInterval(id); // cleanup on unmount
    }, [isConnected,checkConnection]);

  return (
  <NavLink className={`${tabsStyle.tab} ${currentTab==Tab.CARD? tabsStyle.selected : ''}`} to={'/card'}>
      <div style={{display:'flex', alignItems: 'end', gap: '5px'}}>
        <span className={commonStyle.badge}>{currentDetected}</span>
        <AnkiIcon className={`${tabsStyle["anki-logo"]} ` + (isPending ? `${tabsStyle.spinning}`:'')}/>
        <TooltipWrapper 
        classes={[tabsStyle.tooltip]}
        text={`${isPending ? 'connecting..':(isConnected ? 'refresh?' : 'Anki disconnected')}`} 
        tooltipDirection={TooltipDirection.BOTTOM_LEFT}
        styles={{top: '40px', left: '35px'}}
        >
          <span onClick={checkConnection} style={{cursor: 'pointer', color:isPending ? 'gray' : (isConnected ? 'greenyellow' : 'red')}}>●</span>
        </TooltipWrapper>
      </div>
      <p>Detect</p>
  </NavLink>);
};
export default DetectTab;