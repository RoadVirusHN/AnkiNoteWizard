import Menu from "./Menu";
import Tooltip from "./Tooltip";
import Highlight from "./Highlight";
import { useEffect, useState } from "react";
import commonStyle from "./common.module.css";

const App = ({}) => {
  const [isDisplay, setIsDisplay] = useState(true);
  useEffect(()=>{
    console.log("App mounted");
    const handleDisplay = (e: Event) => {
      const customEvent = e as CustomEvent<{ isDisplay: boolean }>;
      console.log("display event :" ,e);
      //setIsDisplay(customEvent.detail.isDisplay);
    };
    window.addEventListener('toggleOverlayDisplay', handleDisplay);
    return ()=>{
      window.removeEventListener('toggleOverlayDisplay', handleDisplay);
    };
  }, []);


  return <>
  <div className={commonStyle["extension-overlay"]} style={{display: isDisplay ? 'block' : 'none'}}>
    test
  </div>
  </>;
};
export default App;