import { NavLink, useLocation } from "react-router";
import tabsStyle from "./tabs.module.css";
import AddCardIcon from "@/public/Icon/Icon-AddCard.svg";
import HistoryIcon from "@/public/Icon/Icon-History.svg";
import CardTypeIcon from "@/public/Icon/Icon-CardType.svg";
import ConfigIcon from "@/public/Icon/Icon-Config.svg";
import { useEffect } from "react";
import useGlobalVarStore, { Tab } from "@/front/utils/useGlobalVarStore";
import DetectTab from "./DetectTab/DetectTab";
import commonStyle from "@/front/common.module.css";
import TooltipWrapper, { TooltipDirection } from "../TooltipWrapper/TooltipWrapper";

const Tabs = ({}) => {
  const location = useLocation();
  const {currentTab, setCurrentTab} = useGlobalVarStore();
  useEffect(() => {
    switch (location.pathname) {
      case '/add':
        if (currentTab !== Tab.ADD) setCurrentTab(Tab.ADD);
        break;
      case '/history':
        if (currentTab !== Tab.HISTORY) setCurrentTab(Tab.HISTORY);
        break;
      case '/templates':
        if (currentTab !== Tab.TEMPLATES) setCurrentTab(Tab.TEMPLATES);
        break;
      case '/config':
        if (currentTab !== Tab.CONFIG) setCurrentTab(Tab.CONFIG);
        break;
      case '/modify':
        if (currentTab !== Tab.CONFIG) setCurrentTab(Tab.TEMPLATES);
        break;
      default:
        if (currentTab !== Tab.DETECT) setCurrentTab(Tab.DETECT);
        break;
    }
  }, [location]);
  return (
  <nav className={`${tabsStyle.tabs} ${commonStyle["no-select"]}`}>
    <DetectTab/>
    <TooltipWrapper text="Comming soon!" tooltipDirection={TooltipDirection.BOTTOM} styles={{flex: '1'}}>
      <NavLink 
      onClick={(e)=>e.preventDefault()}
      className={`${tabsStyle.tab} ${currentTab==Tab.ADD? tabsStyle.selected : ''}`} 
      to={'/add'}>
      <AddCardIcon style={{filter: "grayscale(100%)"}}/>
      <p>Add</p>
      </NavLink>
    </TooltipWrapper>
    <TooltipWrapper text="Comming soon!" tooltipDirection={TooltipDirection.BOTTOM} styles={{flex: '1'}}>
      <NavLink 
      onClick={(e)=>e.preventDefault()}
      className={`${tabsStyle.tab} ${currentTab==Tab.HISTORY? tabsStyle.selected : ''}`} 
      to={'/history'}
      >
        <HistoryIcon style={{fill: "gray"}}/>
        <p>History</p> 
      </NavLink>
    </TooltipWrapper>
    <NavLink className={`${tabsStyle.tab} ${currentTab==Tab.TEMPLATES? tabsStyle.selected : ''}`} to={'/templates'}>
      <CardTypeIcon/>
      <p>Templates</p>
    </NavLink>    
    <TooltipWrapper text="Comming soon!" tooltipDirection={TooltipDirection.BOTTOM_LEFT} styles={{flex: '1'}}>
      <NavLink 
      onClick={(e)=>e.preventDefault()}
      className={`${tabsStyle.tab} ${currentTab==Tab.CONFIG? tabsStyle.selected : ''}`} 
      to={'/config'}>
        <ConfigIcon style={{fill: "gray"}}/>
        <p>Config</p>
      </NavLink>
    </TooltipWrapper>
  </nav>
  );
};
export default Tabs;