import { NavLink, useLocation } from "react-router";
import tabsStyle from "./tabs.module.css";
import AddCardIcon from "@/public/Icon/Icon-AddCard.svg";
import CardTypeIcon from "@/public/Icon/Icon-CardType.svg";
import ConfigIcon from "@/public/Icon/Icon-Config.svg";
import { useEffect } from "react";
import useGlobalVarStore from "@/panel/stores/useGlobalVarStore";
import DetectTab from "./DetectTab/DetectTab";
import commonStyle from "@/panel/common.module.css";
import { useTranslation } from "react-i18next";import Icon from "../Icon/Icon";
import { TAB } from "@/types/app.types";

const Tabs = ({}) => {
  const location = useLocation();
  const {currentTab, setCurrentTab} = useGlobalVarStore();
  const [t] = useTranslation();
  useEffect(() => {
    switch (location.pathname) {
      case '/detect': case '/':
        if (currentTab !== TAB.DETECT) setCurrentTab(TAB.DETECT);
        break;
      case '/add':
        if (currentTab !== TAB.ADD) setCurrentTab(TAB.ADD);
        break;
      case '/scanRules':
        if (currentTab !== TAB.SCAN_RULES) setCurrentTab(TAB.SCAN_RULES);
        break;
      case '/config':
        if (currentTab !== TAB.CONFIG) setCurrentTab(TAB.CONFIG);
        break;
      case '/modify':
        if (currentTab !== TAB.CONFIG) setCurrentTab(TAB.SCAN_RULES);
        break;
      default:
        if (location.pathname.match('/scanRules')!==null) setCurrentTab(TAB.SCAN_RULES);
        // TODO: error handling for unknown path can be added here
        break;
    }
  }, [location]);
  return (
  <nav className={`${tabsStyle.tabs} ${commonStyle["no-select"]}`}>
    <DetectTab/>
    <NavLink 
    className={`${tabsStyle.tab} ${currentTab==TAB.ADD? tabsStyle.selected : ''}`} 
    to={'/add'}>
      <Icon url={AddCardIcon}/>
      <p>{t('tabs.add')}</p>
      </NavLink>
    <NavLink 
    className={`${tabsStyle.tab} ${currentTab==TAB.SCAN_RULES? tabsStyle.selected : ''}`} 
    to={'/scanRules'}>
      <Icon url={CardTypeIcon}/>
      <p>{t('tabs.scanRules')}</p>
    </NavLink>    
    <NavLink 
    className={`${tabsStyle.tab} ${currentTab==TAB.CONFIG? tabsStyle.selected : ''}`} 
    to={'/config'}>
      <Icon url={ConfigIcon}/>
      <p>{t('tabs.config')}</p>
    </NavLink>
  </nav>
  );
};
export default Tabs;