import Menu from "./Menu";
import Tooltip from "./Tooltip";
import Highlight from "./Highlight";
import { useEffect, useState } from "react";
import commonStyles from "./common.module.css";
import { deactivateInspectionMode, EXTENSION_UI_ID, InspectionMode } from "@/scripts/content/tagExtraction2";
import { MessageType } from "@/scripts/background/messageHandler";

enum InspectionState{
  HIGHLIGHT = 'HIGHLIGHT',
  ON_CLICK= 'ON_CLICK'
}
export const getUniqueSelector = (el: HTMLElement): string => {
  if (el.id) return '#' + el.id;

  let path = [];
  while (el.nodeType === Node.ELEMENT_NODE && el.tagName !== 'HTML') {
    let selector = el.nodeName.toLowerCase();
    if (el.className && typeof el.className === 'string') {
      // 클래스가 있으면 추가하되, 공백은 .으로 치환
      const classes = el.className.trim().split(/\s+/).join('.');
      if (classes) selector += '.' + classes;
    }

    // 형제 요소 중 몇 번째인지 확인 (nth-child) - 선택적 정밀도 향상
    let sibling = el;
    let nth = 1;
    while (sibling.previousElementSibling) {
      sibling = sibling.previousElementSibling as HTMLElement;
      if (sibling.nodeName.toLowerCase() === selector.split('.')[0]) nth++;
    }
    if (nth > 1) selector += `:nth-of-type(${nth})`;

    path.unshift(selector);
    el = el.parentNode as HTMLElement;
    if (!el || el.tagName === 'BODY') break;
  }
  return path.join(' > ');
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