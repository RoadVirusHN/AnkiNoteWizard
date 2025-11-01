import useGlobalVarStore from "@/front/utils/useGlobalVarStore";
import AnkiStatus from "./AnkiStatus/AnkiStatus";
import DeckInput from "./DeckInput/DeckInput";
import ManualCardAddBtn from "./ManualCardAddBtn/ManualCardAddBtn";
import footerStyles from "./footer.module.css";
import { Tab } from "@/front/utils/useGlobalVarStore";
import { useEffect, useState } from "react";
import SimpleButton from "../SimpleButton/SimpleButton";
import FlipSvg from "@/public/Flip-Vector.svg"
const Footer = ({}) => {
  const {currentTab} = useGlobalVarStore();
  const [curPage, setCurPage] = useState(<></>);
  useEffect(() => {
    switch (currentTab) {
      case Tab.CUSTOM:
        setCurPage(<div style={{position: 'absolute', display: 'flex', gap: '10px', alignItems: 'end', flexDirection: 'row', right: '10px'}}>
        <SimpleButton text="Flip" svg={FlipSvg} />
        <SimpleButton text="Test" />
        <SimpleButton text="Modify" overridedStyle={{width: '50px', height: '30px', backgroundColor: 'var(--color-warning)', fontWeight: 'bold'}} />
        </div>);
        break;
      default:
        setCurPage(<><DeckInput/><AnkiStatus/><ManualCardAddBtn/></>);
    }
    console.log(curPage);
    console.log(currentTab);
  }, [currentTab]);
  return (
  <footer className={footerStyles.footer}>
    {curPage}      
  </footer>);
};
export default Footer;