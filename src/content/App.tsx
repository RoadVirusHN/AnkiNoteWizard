import Menu from "./Menu";
import Tooltip from "./Tooltip";
import Highlight from "./Highlight";
import { useEffect, useState } from "react";
import commonStyle from "./common.module.css";
import { InspectionMode } from "@/scripts/content/tagExtraction2";

enum InspectionState{
  HIGHLIGHT = 'HIGHLIGHT',
  ON_CLICK= 'ON_CLICK'
}

// 요소 유효성 검사
export const isValidElement = (element: HTMLElement) => {
  if (element.tagName === 'HTML' || element.tagName === 'BODY') return false;
  if (
    element.id === 'extension-overlay' ||
    element.id === 'extension-tooltip' ||
    element.id === 'extension-menu'
  )
    return false;
  return true;
};

const App = ({mode}:{mode:InspectionMode}) => {
  const [state, setState] = useState(InspectionState.HIGHLIGHT);
  const onClick = () =>{
    setState(InspectionState.ON_CLICK);
  };
  return <>
    {state === InspectionState.HIGHLIGHT && <Highlight onClick={onClick}/>}
    {state === InspectionState.ON_CLICK && 
     ( mode == InspectionMode.TAG_EXTRACTION ? <Menu /> : <Tooltip/>)}
  </>;
};
export default App;