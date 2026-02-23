import Menu, { MenuItem } from "./Menu";
import Tooltip from "./Tooltip";
import Highlight from "./Highlight";
import { useEffect, useState } from "react";
import commonStyles from "./common.module.css";
import { deactivateInspectionMode, EXTENSION_UI_ID, InspectionMode } from "@/scripts/content/tagExtraction2";
import { MessageType } from "@/scripts/background/messageHandler";

import "./common.css";
import getCssSelector, { cssSelectorGenerator } from "css-selector-generator";
import useLocale from "@/front/utils/useLocale";

enum InspectionState{
  HIGHLIGHT = 'HIGHLIGHT',
  MENU= 'MENU',
  TOOLTIP= 'TOOLTIP'
}
//TODO : two modes(TAG_EXTRACTION : Non-Unique, TEXT_EXTRACTION : Unique)
export const getUniqueSelector = (el: HTMLElement): string[] => {
  return Array.from(cssSelectorGenerator(el, {maxResults: 3}));
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
  const [text, setText] = useState('');
  const [{x,y}, setPosition] = useState({x:0, y:0});  
  const [items, setItems] = useState<MenuItem[]>([] as MenuItem[]);
  const [menuHeader, setMenuHeader] = useState('');
  const tl = useLocale('background');
  const showTooltip = (text: string, x: number, y: number) => {
    setState(InspectionState.TOOLTIP);
    setText(text);
    setPosition({ x, y });
    setTimeout(() => {
      port.postMessage({ type: MessageType.SEND_INSPECTION_DATA_FROM_CONTENT, data: text });
    }, 2000); // 2초 후에 툴팁 숨김
  };

  const showMenu = (items:MenuItem[], x: number, y: number) => {
    setState(InspectionState.MENU);
    setItems(items);
     // 메뉴 표시 후 클릭 이벤트가 메뉴 외부에서 발생하면 메뉴 숨김
     const handleClickOutside = (e: MouseEvent) => {
      if (!e.target || !(e.target instanceof HTMLElement)) return;
      if (!e.target.closest(`.${commonStyles.menu}`)) {
        setState(InspectionState.HIGHLIGHT);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }
  // 클립보드 복사 및 툴팁 표시
  const copyToClipboard = (text: string, x: number, y: number, port: chrome.runtime.Port) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showTooltip(text, x, y);
      })
      .catch((err) => console.error(err));
  };

  const createMenuItems = (target:HTMLElement, pos:{x:number,y:number}): MenuItem[] =>{
    const {x,y} = pos;
    return [{key:'📄 ' + tl('Extract Text'), onClick:()=>{
        const text =target.textContent?.trim() || '';
        copyToClipboard(text,x, y, port);
      }},
      {key:'🎯 ' + tl('Extract Selector'), onClick:()=>{
        const selector = getUniqueSelector(target);
        setItems(Array.from(selector, s=>({key: s, onClick:()=>{
          copyToClipboard(s,x, y, port);
        }})));
      }},
      {key:'📂 ' + tl('Select Children') + ` (${target.children.length})`, onClick:(e2)=>{
        e2.stopPropagation();
        const children = Array.from(target.children) as HTMLElement[];
        setItems(Array.from(children, (child, index) => ({
          key: `<${child.tagName.toLowerCase()}> ${child.textContent?.trim().slice(0,15) || ''}`,
          onClick: (e3) => {
            e3.stopPropagation();
            setMenuHeader(tl('Select Child') + ` (${index + 1}/${children.length})`);
            setItems(createMenuItems(child, {x,y}));
          },
        })));
      }}
    ]
  };
  const onHighlightClicked = (e:MouseEvent) =>{
    if (state !== InspectionState.HIGHLIGHT) return;
    e.preventDefault();
    e.stopPropagation();
    const target = e.target;
    if (!(target instanceof HTMLElement && isValidElement(target))) return;
    if (mode== InspectionMode.TAG_EXTRACTION) {
      setState(InspectionState.MENU);
      setItems(createMenuItems(target,{x: e.clientX, y: e.clientY}));
    } else {
      copyToClipboard(target.innerText.trim(), e.clientX, e.clientY, port);
    }
  };
  return <>
    {state === InspectionState.HIGHLIGHT && <Highlight onClick={onHighlightClicked}/>}
    {state === InspectionState.MENU &&
     ( mode == InspectionMode.TAG_EXTRACTION && items.length > 0 ? <Menu items={items} 
      header={menuHeader}
      deClick={()=>{
        setState(InspectionState.HIGHLIGHT);
      }} pos={{x,y}}/> : <></>)}
      {
        state === InspectionState.TOOLTIP &&
        <Tooltip text={text} pos={{x,y}}/>
      }
  </>;
};
export default App;