import { useEffect, useRef, useState } from "react";
import commonStyles from "./common.module.css";
import useLocale from "@/front/utils/useLocale";
import { X } from "react-router/dist/development/index-react-server-client-1TI9M9o1";
import { getUniqueSelector } from "./App";

const Menu = ({target, onClick, deClick}:
  {
    target: HTMLElement, 
    onClick:(text: string, x: number, y: number) => void,
    deClick:() => void
  }
) => {
  const [curTarget,setCurTarget] = useState(target);
  const [mode, setMode]= useState<'main' | 'children'>('main');
  const rect = curTarget.getBoundingClientRect();
  const menuRef = useRef<HTMLDivElement>(null);
  const tl = useLocale('background');
  useEffect(()=>{
    const handleClickOutside= (e:MouseEvent)=>{
      if(!e.target || !(e.target instanceof HTMLElement)) return;
      if (menuRef.current &&menuRef.current!==e.target&& !menuRef.current.contains(e.target)) {
        deClick();
      };
    };
    document.addEventListener('click', handleClickOutside);
    return ()=>{
      document.removeEventListener('click', handleClickOutside);
    };
  },[]);
  return <div className={commonStyles.menu} 
    style={{top: rect.top, left: rect.left}}
    ref={menuRef}
  >
    <div className={commonStyles.header}>{mode ==='main' ? (`<${curTarget.tagName.toLowerCase()}> ` + tl('Selected')) : tl('Select Child')}</div>
    {
      mode==='main' ? (
        <>
          <button
            onClick={()=>{
              const text =curTarget.textContent?.trim() || '';
              onClick(text,rect.top, rect.left);
            }}
            >{'📄 ' + tl('Extract Text')}</button>
          <button
          onClick={()=>{
            const selector = getUniqueSelector(curTarget);
            onClick(selector,rect.top, rect.left);
          }}
          >{'🎯 ' + tl('Extract Selector')}</button>
          <button
          onClick={(e)=>{
            e.stopPropagation();
            setMode('children');
          }}
          >{'📂 ' + tl('Select Children') + ` (${curTarget.children.length})`}</button>
        </>
    ) : (
      <>
        <button
          onClick={(e)=>{
            e.stopPropagation();
            setMode('main');
          }}
        >{'⬅️'}</button>
        {Array.from(curTarget.children).map((child, idx)=>(
          <button key={idx}
            onClick={(e)=>{
              e.stopPropagation();
              setCurTarget(child as HTMLElement);
              setMode('main');
            }}
          >{`<${child.tagName.toLowerCase()}> ${child.textContent?.trim().slice(0,15) || '...'}`}</button>
        ))}
      </>
    )}
  </div>;
};
//TODO : change color scheme for dark mode
export default Menu;