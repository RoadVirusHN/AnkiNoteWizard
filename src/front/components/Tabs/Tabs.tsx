import { NavLink, useLocation } from "react-router";
import tabsStyle from "./tabs.module.css";
import AnkiIcon from "@/public/Icon/Icon-Anki.svg";
import AddCardIcon from "@/public/Icon/Icon-AddCard.svg";
import HistoryIcon from "@/public/Icon/Icon-History.svg";
import CardTypeIcon from "@/public/Icon/Icon-CardType.svg";
import ConfigIcon from "@/public/Icon/Icon-Config.svg";
import { useEffect } from "react";
import useGlobalVarStore, { Tab } from "@/front/utils/useGlobalVarStore";

const Tabs = ({}) => {
  const location = useLocation();
  const {currentTab, setCurrentTab} = useGlobalVarStore();
  useEffect(() => {
    switch (location.pathname) {
      case '/history':
        if (currentTab !== Tab.HISTORY) setCurrentTab(Tab.HISTORY);
        break;
      case '/custom':
        if (currentTab !== Tab.CUSTOM) setCurrentTab(Tab.CUSTOM);
        break;
      case '/config':
        if (currentTab !== Tab.CONFIG) setCurrentTab(Tab.CONFIG);
        break;
      default:
        if (currentTab !== Tab.CARD) setCurrentTab(Tab.CARD);
        break;
    }
  }, [location]);
  return (
  <nav className={tabsStyle.tabs}>
    <NavLink className={`${tabsStyle.tab} ${currentTab==Tab.CARD? tabsStyle.selected : ''}`} to={'/card'}>
      <AnkiIcon/>
      <p>Detect</p>
    </NavLink>
    <NavLink className={`${tabsStyle.tab} ${currentTab==Tab.HISTORY? tabsStyle.selected : ''}`} to={'/AddCard'}>
      <AddCardIcon/>
      <p>Add</p>
    </NavLink>
    <NavLink className={`${tabsStyle.tab} ${currentTab==Tab.HISTORY? tabsStyle.selected : ''}`} to={'/history'}>
      <HistoryIcon/>
      <p>History</p> 
    </NavLink>
    <NavLink className={`${tabsStyle.tab} ${currentTab==Tab.CUSTOM? tabsStyle.selected : ''}`} to={'/custom'}>
      <CardTypeIcon/>
      <p>Templates</p>
    </NavLink>
    <NavLink className={`${tabsStyle.tab} ${currentTab==Tab.CONFIG? tabsStyle.selected : ''}`} to={'/config'}>
      <ConfigIcon/>
      <p>Config</p>
    </NavLink>
  </nav>
  );
};
export default Tabs;