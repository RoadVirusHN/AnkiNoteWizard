import Menu from "./Menu";
import Tooltip from "./Tooltip";
import Highlight from "./Highlight";
import { useEffect, useState } from "react";
import commonStyles from "./common.module.css";
import { deactivateInspectionMode, EXTENSION_UI_ID, InspectionMode } from "@/scripts/content/tagExtraction2";
import { MessageType } from "@/scripts/background/messageHandler";

import "./common.css";
import getCssSelector from "css-selector-generator";

enum InspectionState{
  HIGHLIGHT = 'HIGHLIGHT',
  ON_CLICK= 'ON_CLICK'
}
//TODO : two modes(TAG_EXTRACTION : Non-Unique, TEXT_EXTRACTION : Unique)
export const getUniqueSelector = (el: HTMLElement): string => {
  return getCssSelector(el);
};

// 요소 유효성 검사
export const isValidElement = (element: HTMLElement) => {
  if (element.tagName === 'HTML' || element.tagName === 'BODY') return false;
  if (
    element.className.includes(commonStyles["extension-tooltip"]) ||
    element.className.includes(commonStyles.highlight) ||
    element.className.includes(commonStyles.menu)  ||
    element.className.includes(commonStyles.header)  ||
    element.id === EXTENSION_UI_ID
  )
    return false;
  return true;
};

//TODO: App doing to much, split to multiple components
// ex) App: manage state, container: position, Highlight: highlight logic, Menu: menu logic, Tooltip: tooltip logic
const App = ({mode, port}:{mode:InspectionMode, port:chrome.runtime.Port}) => {
  const [state, setState] = useState(InspectionState.HIGHLIGHT);
  const [showingTooltip, setShowingTooltip] = useState(false);
  const [text, setText] = useState('');
  const [{x,y}, setPosition] = useState({x:0, y:0});  
  const [target, setTarget] = useState<HTMLElement>();
  const showTooltip = (text: string, x: number, y: number) => {
    setShowingTooltip(true);
    setText(text);
    setPosition({ x, y });
    setTimeout(() => {
      setShowingTooltip(false);
      port.postMessage({ type: MessageType.SEND_INSPECTION_DATA_FROM_CONTENT, data: text });
    }, 2000); // 2초 후에 툴팁 숨김
  };
  // 클립보드 복사 및 툴팁 표시
  const copyToClipboard = (text: string, x: number, y: number, port: chrome.runtime.Port) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showTooltip(text, x, y);
      })
      .catch((err) => console.error(err));
  };
  const onClick = (e:MouseEvent) =>{
    if (state !== InspectionState.HIGHLIGHT) return;
    console.log("onClicked!");
    e.preventDefault();
    e.stopPropagation();
    setState(InspectionState.ON_CLICK);
    if (mode== InspectionMode.TAG_EXTRACTION) {
      setTarget(e.target as HTMLElement);
    } else {
      copyToClipboard((e.target as HTMLElement).innerHTML.trim(), e.clientX, e.clientY, port);
    }
  };
  return <>
    {state === InspectionState.HIGHLIGHT && <Highlight onClick={onClick}/>}
    {state === InspectionState.ON_CLICK && target &&
     ( mode == InspectionMode.TAG_EXTRACTION ? <Menu target={target} 
      // TODO: Change onClick
      onClick={(text:string,x:number,y:number)=>{
        copyToClipboard(text,x,y,port)
        setTarget(undefined);
      }} 
      deClick={()=>{
        setState(InspectionState.HIGHLIGHT);
      }}/> : <></>)}
    <Tooltip text={text} x={x} y={y} showingTooltip={showingTooltip}/>
  </>;
};
export default App;