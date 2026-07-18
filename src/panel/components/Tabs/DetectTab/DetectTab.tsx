import { NavLink } from "react-router";
import tabsStyle from "../tabs.module.css";
import useGlobalVarStore from "@/panel/stores/useGlobalVarStore";
import AnkiIcon from '@/public/Icon/Icon-Anki.svg';
import useAnkiConnectionStore from "@/panel/stores/useAnkiConnectionStore";
import { useEffect } from "react";
import TooltipWrapper from "../../TooltipWrapper/TooltipWrapper";
import commonStyle from "@/panel/common.module.css";
import { useTranslation } from "react-i18next";
import { TAB, TOOLTIP_DIRECTION } from "@/types/app.types";
import useScanRule from "@/panel/stores/useScanRule";

const DetectTab = ({}) => {
  const {drafts} = useScanRule();
  const {currentTab } = useGlobalVarStore();
  const {isConnected, isPending, checkConnection} = useAnkiConnectionStore();
  const [t] = useTranslation('components', {keyPrefix: 'tabs'});
  useEffect(()=>{
      if (isConnected) return;
      checkConnection();
      const id = setInterval(()=> checkConnection(), 5000);
      return ()=> clearInterval(id); // cleanup on unmount
    }, [isConnected,checkConnection]);

  return (
  <NavLink className={`${tabsStyle.tab} ${currentTab==TAB.DETECT ? tabsStyle.selected : ''}`} to={'/detect'}>
      <div style={{display:'flex', alignItems: 'end', gap: '5px'}}>
        <span className={commonStyle.badge}>{Object.keys(drafts).length}</span>
        <img src={AnkiIcon} className={`${tabsStyle["anki-logo"]} ` + (isPending ? `${tabsStyle.spinning}`:'')}/>
        <TooltipWrapper 
          classes={[tabsStyle.tooltip]}
          text={`${isPending ? t('connecting'):(isConnected ? t('refresh') : t('ankiDisconnected'))}`} 
          tooltipDirection={TOOLTIP_DIRECTION.BOTTOM}
          textStyles={{top: '45px'}}>
          <span onClick={(e)=>{
            e.stopPropagation();
            e.preventDefault();
            checkConnection();
          }} style={{cursor: 'pointer', color:isPending ? 'gray' : (isConnected ? 'greenyellow' : 'red')}}>●</span>
        </TooltipWrapper>
      </div>
      <p>{t('detect')}</p>
  </NavLink>);
};
export default DetectTab;