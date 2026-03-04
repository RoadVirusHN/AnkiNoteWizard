import Menu, { MenuItem } from "./Menu";
import Tooltip from "./Tooltip";
import Highlight from "./Highlight";
import { useState } from "react";
import commonStyles from "./common.module.css";
import { MessageType } from "@/scripts/background/messageHandler";
import "./common.css";
import { cssSelectorGenerator } from "css-selector-generator";
import useLocale from "@/front/utils/useLocale";
import { CssSelectorGeneratorOptionsInput, CssSelectorType } from "css-selector-generator/types/types";
import { EXTENSION_UI_ID, InspectionMode } from "@/scripts/content/constants";

enum InspectionState{
  HIGHLIGHT = 'HIGHLIGHT',
  MENU= 'MENU',
  TOOLTIP= 'TOOLTIP'
}
//TODO : two modes(TAG_EXTRACTION : Non-Unique, FEILD_EXTRACTION : Unique)
export const getUniqueSelector = (el: HTMLElement, cssSelectorOptions:CssSelectorGeneratorOptionsInput): string[] => {
  return Array.from(cssSelectorGenerator(el, cssSelectorOptions));
};
export const uniqueCssSelectorOptions: CssSelectorGeneratorOptionsInput = {
  maxResults: 3, 
  combineWithinSelector: true, // 동일한 요소 내에서 여러 selector 조합 허용 여부
  combineBetweenSelectors: true, // 여러 selector 조합 허용 여부
  blacklist: [EXTENSION_UI_ID, ...Object.values(commonStyles)],
  selectors: ['id', 'class', 'tag', 'attribute', 'nth-child'] as CssSelectorType[],
  includeTag: true, // Css selector에 태그 이름 포함 여부
};
export const nonuniqueCssSelectorOptions: CssSelectorGeneratorOptionsInput = {
  maxResults: 3, 
  blacklist: [EXTENSION_UI_ID, ...Object.values(commonStyles)],
  selectors: ['id', 'class', 'tag', 'attribute'] as CssSelectorType[],
  includeTag: true, // Css selector에 태그 이름 포함 여부
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
const App = ({mode, port, cssSelectorOptions}:{mode:InspectionMode, port:chrome.runtime.Port, cssSelectorOptions:CssSelectorGeneratorOptionsInput}) => {
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

  const showMenu = (items:MenuItem[], x: number, y: number, header:string) => {
    setState(InspectionState.MENU);
    setItems(items);
    setPosition({ x, y });
    setMenuHeader(header);
     // 메뉴 표시 후 클릭 이벤트가 메뉴 외부에서 발생하면 메뉴 숨김
     const handleClickOutside = (e: MouseEvent) => {
      if (!e.target || !(e.target instanceof HTMLElement)) return;
      if (!e.target.closest(`div.${CSS.escape(commonStyles.menu)}`)) { // TODO : 오류 해결
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
        const selector = getUniqueSelector(target, cssSelectorOptions);
        setItems(Array.from(selector, s=>({key: s, onClick:()=>{
          copyToClipboard(s,x, y, port);
        }})));
      }},
      {key:'📂 ' + tl('Select Children') + ` (${target.children.length?? "No Children"})`, onClick:(e2)=>{
        e2.stopPropagation();
        const children = Array.from(target.children) as HTMLElement[];
        if (children.length === 0) return;
        setItems([
          {key: '⬅',onClick: ()=>{
          setItems(createMenuItems(target, {x,y}));
          }},
          ...Array.from(children, (child) => ({
            key: tagToText(child),
            onClick: (e3:MouseEvent) => {
              e3.stopPropagation();
              setMenuHeader(tagToText(child));
              setItems(createMenuItems(child, {x,y}));
        }}))]);
      }}
    ]
  };
  const tagToText = (tag: HTMLElement) => {
    return `<${tag.tagName.toLowerCase()}> ${((tag.textContent.length > 15 ? tag.textContent?.trim().slice(0,12) + "..." : tag.textContent) )|| ''}`;
  };
  const onHighlightClicked = (e:MouseEvent) =>{
    if (state !== InspectionState.HIGHLIGHT) return;
    e.preventDefault();
    e.stopPropagation();
    const target = e.target;
    const rect = (target as HTMLElement).getBoundingClientRect();
    if (!(target instanceof HTMLElement && isValidElement(target))) return;
    if (mode== InspectionMode.TAG_EXTRACTION) {
      showMenu(
        createMenuItems(target,{x: rect.left, y: rect.top},),
        rect.left, rect.top,
        tagToText(target));
    } else {
      copyToClipboard(target.textContent.trim(), rect.left, rect.top, port);
    }
  };
  return <>
    {state === InspectionState.HIGHLIGHT && <Highlight onClick={onHighlightClicked}/>}
    {state === InspectionState.MENU &&
     ( mode == InspectionMode.TAG_EXTRACTION && items.length > 0 ? 
     <Menu items={items} 
      header={menuHeader}
      deClick={()=>{
        setState(InspectionState.HIGHLIGHT);
      }} pos={{x,y}}/> : <></>)}
    {state === InspectionState.TOOLTIP &&
      <Tooltip text={text} pos={{x,y}}/>
    }
  </>;
};
export default App;