import { NavLink, useLocation } from "react-router";
import tabsStyle from "./tabs.module.css";
import AddCardIcon from "@/public/Icon/Icon-AddCard.svg";
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
      case '/detect': case '/':
        if (currentTab !== Tab.DETECT) setCurrentTab(Tab.DETECT);
        break;
      case '/add':
        if (currentTab !== Tab.ADD) setCurrentTab(Tab.ADD);
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
        if (location.pathname.match('/templates')!==null) setCurrentTab(Tab.TEMPLATES);
        // TODO: error handling for unknown path can be added here
        break;
    }
  }, [location]);
  return (
  <nav className={`${tabsStyle.tabs} ${commonStyle["no-select"]}`}>
    <DetectTab/>
      <NavLink 
      className={`${tabsStyle.tab} ${currentTab==Tab.ADD? tabsStyle.selected : ''}`} 
      to={'/add'}>
      <img src={AddCardIcon} style={{filter: "grayscale(100%)"}}/>
      <p>Add</p>
      </NavLink>
    <NavLink 
    className={`${tabsStyle.tab} ${currentTab==Tab.TEMPLATES? tabsStyle.selected : ''}`} 
    to={'/templates'}>
      <img src={CardTypeIcon}/>
      <p>Templates</p>
    </NavLink>    
    <NavLink 
    className={`${tabsStyle.tab} ${currentTab==Tab.CONFIG? tabsStyle.selected : ''}`} 
    to={'/config'}>
      <img src={ConfigIcon} style={{fill: "gray"}}/>
      <p>Config</p>
    </NavLink>
  </nav>
  );
};
export default Tabs;